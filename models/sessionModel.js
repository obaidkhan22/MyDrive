import { Schema, model } from "mongoose";

const sessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
  },
  createdAt: {
    type: Date,
    expires: 3600,
  },
});

const Session = model("Session", sessionSchema);

export default Session;
