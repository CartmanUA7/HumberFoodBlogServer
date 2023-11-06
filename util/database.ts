import mongoose from 'mongoose';
import { config } from './config';

mongoose
  .connect(config.db.uri, config.db.options)
  .then(() => console.log("MongoDB Connected.."))
  .catch((err) => console.log("Error connecting to DB" + err));

export { mongoose }