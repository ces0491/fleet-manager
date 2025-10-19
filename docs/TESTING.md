# Testing Guide

## Overview

Fleet Manager includes comprehensive test suites for both backend (Jest + Supertest) and frontend (Vitest + React Testing Library).

## Quick Start

### Backend Tests
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Frontend Tests
```bash
cd frontend
npm test              # Run all tests
npm run test:ui       # Interactive UI
npm run test:coverage # With coverage
```

## Test Coverage

- **Backend**: 55+ tests covering authentication, API endpoints, middleware, and business logic
- **Frontend**: 7+ component tests for authentication flows
- **Total**: 62+ tests ensuring code quality

## Backend Testing (Jest + Supertest)

### Test Structure
```
backend/src/__tests__/
├── setup.ts                    # Global configuration
├── middleware/
│   └── auth.test.ts           # Auth middleware tests
├── routes/
│   ├── auth.test.ts           # Authentication endpoints
│   └── vehicles.test.ts       # Vehicle CRUD tests
└── utils/
    ├── testHelpers.ts         # Test utilities
    └── calculations.test.ts   # Business logic tests
```

### Writing Backend Tests

```typescript
import request from 'supertest';
import express from 'express';

describe('API Endpoint', () => {
  it('should return data', async () => {
    const response = await request(app).get('/api/endpoint');
    expect(response.status).toBe(200);
  });
});
```

## Frontend Testing (Vitest + React Testing Library)

### Test Structure
```
frontend/src/__tests__/
├── setup.ts                        # Global configuration
├── components/
│   └── Auth/
│       └── Login.test.tsx         # Login component tests
└── utils/
    └── testUtils.tsx              # Custom render with providers
```

### Writing Frontend Tests

```typescript
import { render, screen } from '../utils/testUtils';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });
});
```

## Test Utilities

### Backend Helpers
- `generateTestToken(userId, role)` - Create JWT tokens
- `mockUser`, `mockAdminUser`, `mockManagerUser` - Test users
- `mockVehicle`, `mockWeeklyData` - Test data
- `calculateFinancials(data)` - Business logic helper

### Frontend Helpers
- `render(<Component />)` - Render with providers
- `mockAuthUser` - Sample user data
- `setAuthToken(token)` - Set test token
- `clearAuthToken()` - Clear test token

## Coverage Goals

| Category | Target | Status |
|----------|--------|--------|
| Authentication & Auth | 95%+ | ✅ Achieved |
| API Endpoints | 80%+ | ✅ On track |
| Business Logic | 90%+ | ✅ Achieved |
| UI Components | 70%+ | 🔄 Foundation ready |

## Best Practices

1. **Test behavior, not implementation** - Focus on user experience
2. **Arrange-Act-Assert pattern** - Keep tests organized
3. **Isolation** - Each test should be independent
4. **Descriptive names** - Use "should" statements
5. **Mock external dependencies** - Database, APIs, file system

## Troubleshooting

**Tests timeout:**
```typescript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

**Mock not working:**
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## CI/CD Integration

```yaml
# Example GitHub Actions
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm install && npm test
      - run: cd frontend && npm install && npm test
```

For detailed testing examples and patterns, see the test files in `backend/src/__tests__/` and `frontend/src/__tests__/`.
