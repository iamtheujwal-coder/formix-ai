import mongoose, { Schema, Document, Model } from "mongoose";

export interface IForm {
  userId: mongoose.Types.ObjectId;
  prompt: string;
  title: string;
  schema: Record<string, unknown>; // stored as Mixed in Mongo — no conflict since we don't extend Document in a way Mongoose's schema field conflicts
  googleFormLink?: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

// Use a plain object schema definition to avoid the Mongoose Document.schema conflict
const formSchemaDefinition = {
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  schema: {
    type: Schema.Types.Mixed,
    required: true,
  },
  googleFormLink: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FormMongooseSchema = new Schema<any>(formSchemaDefinition, {
  timestamps: true,
});

// Add index for faster history fetching
FormMongooseSchema.index({ userId: 1, createdAt: -1 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Form: Model<any> =
  mongoose.models.Form || mongoose.model("Form", FormMongooseSchema);

export default Form;
