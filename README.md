# Fleet Manager

A comprehensive web application for managing vehicle fleets with financial tracking and Excel export capabilities.

**Perfect for:** Ride-sharing services (Uber, Bolt, Lyft), delivery fleets, taxi companies, courier services, corporate vehicle management, and any vehicle fleet operation.

**Developed by:** [Sheet Solved - Spreadsheets Solved](https://sheetsolved.com)

## Features

- 🚗 **Unlimited Vehicle Tracking** - Manage fleets of any size with detailed financial data
- 📊 **Weekly Performance Tracking** - Monday-Sunday reporting periods
- 💰 **Comprehensive Financial Metrics** - Track revenue, expenses, repairs, and net profits
- 📈 **Profitability Analysis** - Compare performance across your entire fleet
- 📥 **Excel Export** - Professional reports with South African Rand (ZAR) formatting
- 🔒 **Multi-User Support** - Secure JWT authentication with role-based access (Admin, Manager, Viewer)
- 📱 **Mobile Optimized** - Fully responsive design for on-the-go fleet management
- 🌐 **Cloud Ready** - Easy deployment to Render, AWS, or any cloud platform
- 💾 **Scalable Database** - PostgreSQL with Prisma handles fleets from 1 to 1000+ vehicles
- 🛡️ **POPIA Compliant** - Built-in compliance for South Africa's data protection law (see [POPIA_COMPLIANCE_GUIDE.md](POPIA_COMPLIANCE_GUIDE.md))
- 🆓 **Open Source** - GPL-3.0 licensed, free to use and modify

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Excel Generation**: ExcelJS
- **Deployment**: Docker, Render

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or cloud)
- Git

### Installation

1. Install dependencies:
\\\ash
npm run install:all
\\\

2. Set up environment variables:
\\\ash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
\\\

3. Update the environment files with your values (use DATABASE_URL for PostgreSQL connection)

4. Setup PostgreSQL database:
\\\ash
cd backend
psql -U postgres -c "CREATE DATABASE fleet_manager;"
npx prisma migrate dev
npx prisma generate
\\\

### Development

Run both frontend and backend in development mode:
\\\ash
npm run dev
\\\

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Building for Production

\\\ash
npm run build
npm start
\\\

## Deployment to Render

1. Push code to GitHub
2. Connect repository to Render
3. Deploy using render.yaml configuration
4. Set environment variables in Render dashboard

## Data Structure

### Vehicle Data (Weekly)

- Vehicle Number Plate
- Weekly Rental Amount
- Driver Earnings
- Repair Costs
- Net Amount to Driver
- Insurance Costs
- Tracker Fees

### Key Metrics

- Weekly profitability per vehicle
- Comparative analysis across fleet
- Cost vs. revenue tracking
- Maintenance cost trends

## Security Features

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- Input validation
- CORS protection
- Helmet.js security headers

## Mobile Optimization

- Progressive Web App (PWA) support
- Responsive design
- Touch-optimized UI
- Offline capability
- Fast loading times

## API Endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile

### Vehicles

- GET /api/vehicles
- POST /api/vehicles
- PUT /api/vehicles/:id
- DELETE /api/vehicles/:id

### Weekly Data

- GET /api/weekly-data
- POST /api/weekly-data
- PUT /api/weekly-data/:id
- GET /api/weekly-data/export

## License

**GNU General Public License v3.0 (GPL-3.0)**

Copyright © 2025 Sheet Solved. All Rights Reserved.

This is a **FREE VERSION** provided under the GNU GPL v3 license.

⚠️ **NO WARRANTY** - This software is provided "as is" without warranty of any kind. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md) for details.

### What this means:

- ✅ Free to use, modify, and distribute
- ✅ Must remain open source under GPL-3.0
- ✅ Copyright remains with Sheet Solved
- ❌ No warranties or guarantees
- ❌ No liability for damages
- ❌ No official support

For commercial licenses, support contracts, or premium versions:

- **Email:** cesaire@sheetsolved.com
- **Website:** https://sheetsolved.com
- **Company:** Sheet Solved - Spreadsheets Solved

See the following files for complete licensing information:

- [LICENSE](LICENSE) - Full GPL-3.0 license text
- [NOTICE.md](NOTICE.md) - Important disclaimers and terms
- [COPYRIGHT](COPYRIGHT) - Copyright information

## POPIA Compliance (South Africa)

This application includes built-in compliance features for the **Protection of Personal Information Act (POPIA)** of South Africa:

### Implemented Features

- ✅ **Privacy Policy & Terms of Service** - Complete POPIA-compliant documentation
- ✅ **Consent Management** - Track and manage user consents with full audit trail
- ✅ **Data Subject Rights** - API endpoints for access, correction, deletion, portability
- ✅ **Audit Logging** - Complete trail of all data access and modifications
- ✅ **Data Retention** - Automated cleanup based on legal requirements
- ✅ **Encryption** - AES-256-GCM encryption for sensitive PII
- ✅ **Breach Response** - Documented procedures for incident response
- ✅ **Privacy Settings UI** - User-facing interface for exercising rights

### Quick Start for POPIA Compliance

1. **Review the compliance guide:**
   - [POPIA_COMPLIANCE_GUIDE.md](POPIA_COMPLIANCE_GUIDE.md) - Complete implementation guide

2. **Configure encryption:**
   ```bash
   cd backend
   node -r esbuild-register src/utils/encryption.ts
   # Copy the generated ENCRYPTION_KEY to your .env file
   ```

3. **Customize privacy documents:**
   - [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
   - [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md)
   - [DATA_BREACH_RESPONSE.md](DATA_BREACH_RESPONSE.md)

4. **Set up automated data retention:**
   ```bash
   # Add to crontab for monthly cleanup:
   0 2 1 * * cd /path/to/backend && npm run data-retention-cleanup
   ```

5. **Appoint an Information Officer and register with the Information Regulator if required**

### Key POPIA Responsibilities

As the Responsible Party (organization deploying this software), you must:

- Appoint an Information Officer
- Provide privacy notices to drivers and users
- Obtain valid consent for data processing
- Respond to data subject requests within 30 days
- Report data breaches within 72 hours to the Information Regulator
- Maintain security safeguards
- Conduct annual Privacy Impact Assessments

**For detailed compliance requirements, see [POPIA_COMPLIANCE_GUIDE.md](POPIA_COMPLIANCE_GUIDE.md)**

### Support & Resources

- **Information Regulator:** https://inforegulator.org.za / 012 406 4818
- **Technical Support:** cesaire@sheetsolved.com
- **Compliance Questions:** See the FAQ in [POPIA_COMPLIANCE_GUIDE.md](POPIA_COMPLIANCE_GUIDE.md)
