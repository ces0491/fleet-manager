import { calculateFinancials } from '../utils/testHelpers';

describe('Financial Calculations', () => {
  describe('calculateFinancials', () => {
    it('should calculate total revenue correctly', () => {
      const data = {
        cashCollected: 5000,
        onlineEarnings: 3000,
        dieselExpense: 0,
        tollsParking: 0,
        maintenanceRepairs: 0,
        otherExpenses: 0,
      };

      const result = calculateFinancials(data);

      expect(result.totalRevenue).toBe(8000);
    });

    it('should calculate total deductions correctly', () => {
      const data = {
        cashCollected: 0,
        onlineEarnings: 0,
        dieselExpense: 2000,
        tollsParking: 500,
        maintenanceRepairs: 300,
        otherExpenses: 200,
      };

      const result = calculateFinancials(data);

      expect(result.totalDeductions).toBe(3000);
    });

    it('should calculate net profit correctly', () => {
      const data = {
        cashCollected: 5000,
        onlineEarnings: 3000,
        dieselExpense: 2000,
        tollsParking: 500,
        maintenanceRepairs: 300,
        otherExpenses: 200,
      };

      const result = calculateFinancials(data);

      expect(result.totalRevenue).toBe(8000);
      expect(result.totalDeductions).toBe(3000);
      expect(result.netProfit).toBe(5000);
    });

    it('should calculate profit margin correctly', () => {
      const data = {
        cashCollected: 5000,
        onlineEarnings: 3000,
        dieselExpense: 2000,
        tollsParking: 500,
        maintenanceRepairs: 300,
        otherExpenses: 200,
      };

      const result = calculateFinancials(data);

      expect(result.profitMargin).toBe(62.5);
    });

    it('should handle negative profit correctly', () => {
      const data = {
        cashCollected: 1000,
        onlineEarnings: 500,
        dieselExpense: 2000,
        tollsParking: 500,
        maintenanceRepairs: 300,
        otherExpenses: 200,
      };

      const result = calculateFinancials(data);

      expect(result.totalRevenue).toBe(1500);
      expect(result.totalDeductions).toBe(3000);
      expect(result.netProfit).toBe(-1500);
      expect(result.profitMargin).toBe(-100);
    });

    it('should handle zero revenue correctly', () => {
      const data = {
        cashCollected: 0,
        onlineEarnings: 0,
        dieselExpense: 2000,
        tollsParking: 500,
        maintenanceRepairs: 300,
        otherExpenses: 200,
      };

      const result = calculateFinancials(data);

      expect(result.totalRevenue).toBe(0);
      expect(result.profitMargin).toBe(0);
    });

    it('should round profit margin to 2 decimal places', () => {
      const data = {
        cashCollected: 1000,
        onlineEarnings: 2000,
        dieselExpense: 1000,
        tollsParking: 333,
        maintenanceRepairs: 0,
        otherExpenses: 0,
      };

      const result = calculateFinancials(data);

      expect(result.totalRevenue).toBe(3000);
      expect(result.totalDeductions).toBe(1333);
      expect(result.netProfit).toBe(1667);
      expect(result.profitMargin).toBe(55.57); // Should be rounded to 2 decimals
    });

    it('should handle perfect 100% profit (no deductions)', () => {
      const data = {
        cashCollected: 5000,
        onlineEarnings: 3000,
        dieselExpense: 0,
        tollsParking: 0,
        maintenanceRepairs: 0,
        otherExpenses: 0,
      };

      const result = calculateFinancials(data);

      expect(result.profitMargin).toBe(100);
    });

    it('should handle decimal values correctly', () => {
      const data = {
        cashCollected: 5432.75,
        onlineEarnings: 3210.50,
        dieselExpense: 2100.25,
        tollsParking: 567.80,
        maintenanceRepairs: 345.90,
        otherExpenses: 123.45,
      };

      const result = calculateFinancials(data);

      expect(result.totalRevenue).toBe(8643.25);
      expect(result.totalDeductions).toBe(3137.40);
      expect(result.netProfit).toBeCloseTo(5505.85, 2);
      expect(result.profitMargin).toBeCloseTo(63.70, 1);
    });

    it('should handle all zero values', () => {
      const data = {
        cashCollected: 0,
        onlineEarnings: 0,
        dieselExpense: 0,
        tollsParking: 0,
        maintenanceRepairs: 0,
        otherExpenses: 0,
      };

      const result = calculateFinancials(data);

      expect(result.totalRevenue).toBe(0);
      expect(result.totalDeductions).toBe(0);
      expect(result.netProfit).toBe(0);
      expect(result.profitMargin).toBe(0);
    });
  });
});
