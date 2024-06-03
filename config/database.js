const { MongoClient, ServerApiVersion } = require("mongodb");

const uri =
  "mongodb+srv://grupp7:grupp7swe@airbean.slpvtll.mongodb.net/?retryWrites=true&w=majority&appName=airbean";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectToMongoDB = async () => {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("Airbean").command({ ping: 1 });
    console.log("Connected successfully to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = { connectToMongoDB, client };
