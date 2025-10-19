import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logAuthAttempt, createAuditLog } from '../middleware/auditLogger';
import emailService from '../services/emailService';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'manager', 'viewer']).withMessage('Invalid role')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email or username' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Get IP and user agent
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';

      // Create user and consent records in a transaction
      const user = await prisma.$transaction(async (tx) => {
        // Create new user
        const newUser = await tx.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
            role: role ? role.toUpperCase() : 'VIEWER'
          }
        });

        // Create initial consent records
        await tx.userConsent.createMany({
          data: [
            {
              userId: newUser.id,
              consentType: 'TERMS_OF_SERVICE',
              consentGiven: true,
              consentVersion: '1.0',
              ipAddress,
              userAgent,
            },
            {
              userId: newUser.id,
              consentType: 'PRIVACY_POLICY',
              consentGiven: true,
              consentVersion: '1.0',
              ipAddress,
              userAgent,
            },
            {
              userId: newUser.id,
              consentType: 'DATA_PROCESSING',
              consentGiven: true,
              consentVersion: '1.0',
              ipAddress,
              userAgent,
            },
          ]
        });

        return newUser;
      });

      // Log registration (outside transaction to avoid blocking)
      try {
        await createAuditLog(req, {
          action: 'CREATE',
          resource: 'USER',
          resourceId: user.id,
          details: `User registered: ${email}`,
        });
      } catch (auditError) {
        console.error('Audit log error (non-critical):', auditError);
        // Don't fail registration if audit log fails
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role.toLowerCase()
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred during registration'
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        await logAuthAttempt(req, email, false, 'User not found');
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is active
      if (!user.isActive) {
        await logAuthAttempt(req, email, false, 'Account inactive');
        return res.status(401).json({ message: 'Account is inactive. Please contact administrator.' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await logAuthAttempt(req, email, false, 'Invalid password');
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Log successful login
      await logAuthAttempt(req, email, true);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role.toLowerCase(),
          lastLogin: new Date()
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role.toLowerCase(),
        isActive: req.user.isActive,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
});

/**
 * PUT /api/auth/change-password
 * Change user password
 */
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
  }
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // Always return success message for security (don't reveal if email exists)
      if (!user) {
        return res.json({ message: 'If an account exists with that email, you will receive password reset instructions.' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Token expires in 1 hour
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      // Save hashed token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry
        }
      });

      // Send email with reset link
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
        return res.status(500).json({
          message: 'Failed to send reset email. Please try again later or contact support.'
        });
      }

      // Log the password reset request
      try {
        await createAuditLog(req, {
          userId: user.id,
          action: 'CREATE',
          resource: 'AUTH',
          resourceId: user.id,
          details: 'Password reset requested',
        });
      } catch (auditError) {
        console.error('Audit log error (non-critical):', auditError);
      }

      res.json({ message: 'If an account exists with that email, you will receive password reset instructions.' });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Password reset request failed', error: error.message });
    }
  }
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, newPassword } = req.body;

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token
      const user = await prisma.user.findFirst({
        where: {
          resetToken: hashedToken,
          resetTokenExpiry: {
            gt: new Date() // Token must not be expired
          }
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      // Log the password reset
      try {
        await createAuditLog(req, {
          userId: user.id,
          action: 'UPDATE',
          resource: 'AUTH',
          resourceId: user.id,
          details: 'Password reset completed',
        });
      } catch (auditError) {
        console.error('Audit log error (non-critical):', auditError);
      }

      res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Password reset failed', error: error.message });
    }
  }
);

export default router;
