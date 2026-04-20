import mongoose, { Schema, Model } from "mongoose";

export type PlanType = "free" | "starter" | "pro";

// Don't extend Document here, it causes TS type incompatibilities down the line. 
// Just a plain interface. Mongoose methods will add the needed properties.
export interface IUser {
  email: string;
  name: string;
  image?: string;
  plan: PlanType;
  creditsRemaining: number;
  lastReset: Date;
  razorpayCustomerId?: string;
  razorpaySubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchemaDefinition = {
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: "",
  },
  plan: {
    type: String,
    enum: ["free", "starter", "pro"],
    default: "free",
  },
  creditsRemaining: {
    type: Number,
    default: 800,
  },
  lastReset: {
    type: Date,
    default: () => new Date(),
  },
  razorpayCustomerId: {
    type: String,
    default: "",
  },
  razorpaySubscriptionId: {
    type: String,
    default: "",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UserSchema = new Schema<any>(userSchemaDefinition, {
  timestamps: true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const User: Model<any> =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
