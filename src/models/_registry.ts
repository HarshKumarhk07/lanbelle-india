import { type Model, type Schema, model, models } from "mongoose";

/**
 * Registers (or returns the already-registered) Mongoose model. Prevents the
 * "OverwriteModelError" during Next.js hot-reload / serverless re-evaluation.
 */
export function registerModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (models[name] as Model<T>) ?? model<T>(name, schema);
}
