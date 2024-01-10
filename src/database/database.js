import mongoose from "mongoose";

const {DB_NAME, DB_USERNAME, DB_PASSWORD} = process.env;

const URI = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@distancesolution.7e12cno.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

(async () => {
  try {
    const db = await mongoose.connect(URI);

    console.log("Database connected to: ", db.connection.name);
  } catch (error) {
    console.log(error);
  }
})();
