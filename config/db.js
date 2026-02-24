import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/storageApp");
    console.log("Successfully connected to MongoDB.");
  } catch (error) {
    console.log(error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  process.exit(0);
});
