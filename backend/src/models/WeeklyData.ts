import mongoose, { Document, Schema } from 'mongoose';

export interface IWeeklyData extends Document {
  vehicleId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  weekEndDate: Date;

  // Revenue data
  cashCollected: number;
  onlineEarnings: number;
  totalRevenue: number;

  // Deductions
  dieselExpense: number;
  tollsParking: number;
  maintenanceRepairs: number;
  otherExpenses: number;
  totalDeductions: number;

  // Calculated fields
  netProfit: number;
  profitMargin: number;

  // Additional metrics
  totalTrips?: number;
  totalDistance?: number;
  averageRating?: number;

  notes?: string;
  submittedBy?: mongoose.Types.ObjectId;
  submittedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const WeeklyDataSchema = new Schema<IWeeklyData>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    weekStartDate: {
      type: Date,
      required: true
    },
    weekEndDate: {
      type: Date,
      required: true
    },

    // Revenue
    cashCollected: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    onlineEarnings: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    totalRevenue: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    // Deductions
    dieselExpense: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    tollsParking: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    maintenanceRepairs: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    otherExpenses: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    totalDeductions: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    // Calculated
    netProfit: {
      type: Number,
      required: true,
      default: 0
    },
    profitMargin: {
      type: Number,
      required: true,
      default: 0,
      min: -100,
      max: 100
    },

    // Additional metrics
    totalTrips: {
      type: Number,
      min: 0
    },
    totalDistance: {
      type: Number,
      min: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5
    },

    notes: {
      type: String,
      trim: true
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index to ensure one entry per vehicle per week
WeeklyDataSchema.index({ vehicleId: 1, weekStartDate: 1 }, { unique: true });
WeeklyDataSchema.index({ weekStartDate: 1, weekEndDate: 1 });
WeeklyDataSchema.index({ vehicleId: 1, createdAt: -1 });

// Pre-save middleware to calculate totals
WeeklyDataSchema.pre('save', function(next) {
  this.totalRevenue = this.cashCollected + this.onlineEarnings;
  this.totalDeductions = this.dieselExpense + this.tollsParking +
                        this.maintenanceRepairs + this.otherExpenses;
  this.netProfit = this.totalRevenue - this.totalDeductions;
  this.profitMargin = this.totalRevenue > 0
    ? (this.netProfit / this.totalRevenue) * 100
    : 0;
  next();
});

export default mongoose.model<IWeeklyData>('WeeklyData', WeeklyDataSchema);
