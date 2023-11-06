import mongoose from "mongoose";

require("dotenv").config();

const config = {
  db: {
    uri: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.${process.env.DB_CLUSTER_ID}.mongodb.net/${process.env.DB_DATABASE}`,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions,
  },
};

export { config }