import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicle extends Document {
  vehicleNumber: string;
  driverName: string;
  phoneNumber: string;
  status: 'active' | 'inactive' | 'maintenance';
  addedDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    driverName: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active'
    },
    addedDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
VehicleSchema.index({ vehicleNumber: 1 });
VehicleSchema.index({ status: 1 });
VehicleSchema.index({ driverName: 1 });

export default mongoose.model<IVehicle>('Vehicle', VehicleSchema);
