import mongoose from "mongoose";
const dbconnect = async (app) => {
  console.log("Loading ENV variables...");
  console.log("MONGO_URI:", process.env.MONGO_URI);
  console.log("PORT:", process.env.PORT);
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
    })
    .then(() => {
      app.listen(3000, () => {
        console.log(
          "listing port ...",
          process.env.MONGO_URI,
          process.env.PORT,
        );
      });
    })
    .catch((err) => console.error(err));
};
export default dbconnect;
