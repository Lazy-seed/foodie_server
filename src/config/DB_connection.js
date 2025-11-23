import { connect } from "mongoose";

const ConnectDB = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
};

export default ConnectDB;
