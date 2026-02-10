import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017/storageApp")

export async function connectDB() {
   try {
      await client.connect()
      console.log("Connected to MongoDB!")
      return client.db()
   } catch (error) {
      console.log("Error connecting to MongoDB.")
   }
}

process.on("SIGINT", async () => {
   await client.close()
   console.log("Client Disconnected!")
   process.exit(0)
})