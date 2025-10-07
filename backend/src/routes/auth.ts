import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logAuthAttempt, createAuditLog } from '../middleware/auditLogger';
import UserConsent from '../models/UserConsent';

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
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email or username' });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        role: role || 'viewer'
      });

      await user.save();

      // Create initial consent records
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      await UserConsent.create([
        {
          userId: user._id,
          consentType: 'terms_of_service',
          consentGiven: true,
          consentVersion: '1.0',
          ipAddress,
          userAgent,
        },
        {
          userId: user._id,
          consentType: 'privacy_policy',
          consentGiven: true,
          consentVersion: '1.0',
          ipAddress,
          userAgent,
        },
        {
          userId: user._id,
          consentType: 'data_processing',
          consentGiven: true,
          consentVersion: '1.0',
          ipAddress,
          userAgent,
        },
      ]);

      // Log registration
      await createAuditLog(req, {
        action: 'create',
        resource: 'user',
        resourceId: (user._id as any).toString(),
        details: `User registered: ${email}`,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
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
      const user = await User.findOne({ email });
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
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await logAuthAttempt(req, email, false, 'Invalid password');
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Log successful login
      await logAuthAttempt(req, email, true);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
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
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
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
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
  }
);

export default router;
