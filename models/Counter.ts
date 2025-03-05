import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
  pageviews: number;
  visits: number;
}

const CounterSchema = new Schema<ICounter>({
  pageviews: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
});

export const Counter =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);
