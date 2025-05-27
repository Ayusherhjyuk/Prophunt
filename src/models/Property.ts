import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  id: string;
  title: string;
  type: string;
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string;
  furnished: string;
  available: string;
  listedBy: string;
  tags: string;
  colorTheme: string;
  rating: number;
  isVerified: boolean;
  listingType: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  areaSqFt: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  amenities: { type: String },
  furnished: { type: String },
  available: { type: String },
  listedBy: { type: String, required: true },
  tags: { type: String },
  colorTheme: { type: String },
  rating: { type: Number, min: 0, max: 5 },
  isVerified: { type: Boolean, default: false },
  listingType: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

propertySchema.index({ city: 1, state: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ createdBy: 1 });

export default mongoose.model<IProperty>('Property', propertySchema);