import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;
const handledError = (err) => console.log("🔴 Error! : ", err);
const handledOpen = () => console.log("🟢 Connected db");

db.on("error", handledError);
db.once("open", handledOpen);
