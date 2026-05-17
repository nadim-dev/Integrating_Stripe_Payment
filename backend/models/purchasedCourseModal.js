import { Schema, model } from "mongoose";

const purchasedCourseSchema = new Schema({

   userId: {
      type: Schema.Types.ObjectId,
   },

   courseId: {
      type: Schema.Types.ObjectId,
      ref: "courses",
      required: true
   },

   sessionId: {
      type: String,
      required: true
   },

   amountPaid: {
      type: Number,
      required: true
   },

   purchasedAt: {
      type: Date,
      default: Date.now
   },

   accessExpiresAt: {
      type: Date,
      required: true
   },

}, {
   timestamps: true
});

export const PurchasedCourse =
   model("PurchasedCourse", purchasedCourseSchema);