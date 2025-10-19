# Fleet Manager

A web application for managing vehicle fleets with financial tracking and Excel export capabilities.

**Perfect for:** Ride-sharing services (Uber, Bolt, Lyft), delivery fleets, taxi companies, courier services, corporate vehicle management, and any vehicle fleet operation.

**Developed by:** [Sheet Solved](https://sheetsolved.com)

## Features

- 🚗 **Vehicle Tracking** - Manage fleets of any size with detailed financial data
- 📊 **Weekly Performance** - Monday-Sunday reporting periods
- 💰 **Financial Metrics** - Track revenue, expenses, repairs, and net profits
- 📈 **Analytics** - Compare performance across your entire fleet
- 📥 **Excel Export** - Professional reports with ZAR formatting
- 🔒 **Multi-User** - Role-based access (Admin, Manager, Viewer)
- 📱 **Mobile Optimized** - Fully responsive design
- 🛡️ **POPIA Compliant** - South African data protection compliance
- 🆓 **Open Source** - GPL-3.0 licensed

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git

### Installation

```bash
# 1. Clone repository
git clone <your-repo-url>
cd fleet-manager

# 2. Install dependencies
npm run install:all

# 3. Set up environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Create database
cd backend
psql -U postgres -c "CREATE DATABASE fleet_manager;"
npx prisma migrate dev
npx prisma generate

# 5. Run application
cd ..
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT with bcrypt
- **Excel**: ExcelJS

## Documentation

All documentation is located in the [`/docs`](./docs) folder:

### Setup & Configuration
- [Setup Guide](./docs/SETUP.md) - Detailed installation and configuration
- [Password Reset](./docs/PASSWORD_RESET.md) - Email configuration for password resets

### Development
- [Testing Guide](./docs/TESTING.md) - How to run and write tests
- [Code Quality](./docs/CODE_QUALITY.md) - Code review and standards

### Legal & Compliance
- [POPIA Compliance](./docs/POPIA_COMPLIANCE_GUIDE.md) - South African data protection
- [Privacy Policy](./docs/PRIVACY_POLICY.md) - User privacy policy
- [Terms of Service](./docs/TERMS_OF_SERVICE.md) - Terms and conditions
- [Data Breach Response](./docs/DATA_BREACH_RESPONSE.md) - Incident procedures
- [Notice](./docs/NOTICE.md) - Disclaimers and terms
- [Disclaimer](./docs/DISCLAIMER.md) - Warranty disclaimers

## Key Features

### Vehicle Management
- Add, edit, delete vehicles
- Track driver information
- Monitor vehicle status (Active, Inactive, Maintenance)

### Financial Tracking
- Weekly revenue (cash + online earnings)
- Expense categorization (diesel, tolls, maintenance, other)
- Automatic profit calculations
- Profit margin analysis

### Reporting
- Excel export with professional formatting
- Vehicle-specific reports
- Fleet-wide summaries
- Custom date ranges

### Security & Compliance
- JWT authentication
- Password hashing (bcrypt)
- PII encryption (AES-256-GCM)
- Rate limiting
- Input validation
- Audit logging
- POPIA data subject rights

## License

**GNU General Public License v3.0 (GPL-3.0)**

Copyright © 2025 Sheet Solved. All Rights Reserved.

This is a **FREE VERSION** under GNU GPL v3.

### What this means:
- ✅ Free to use, modify, and distribute
- ✅ Must remain open source
- ✅ Copyright remains with Sheet Solved
- ❌ No warranties or guarantees
- ❌ No liability for damages

For commercial licenses or support: cesaire@sheetsolved.com

See [LICENSE](LICENSE), [NOTICE](./docs/NOTICE.md), and [DISCLAIMER](./docs/DISCLAIMER.md) for details.

## Support

- **Email**: cesaire@sheetsolved.com
- **Website**: https://sheetsolved.com
- **Documentation**: [/docs](./docs)

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Write tests
4. Submit a pull request

See [Code Quality Guide](./docs/CODE_QUALITY.md) for standards.
