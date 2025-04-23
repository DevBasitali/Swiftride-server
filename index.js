// import express from "express"
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import user from "./routes/user.js";
import Booking from "./routes/bookingRoute.js";
import admin from "./routes/Admin.js";
import dbconnect from "./DB/db.js";
import car from "./routes/cars.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const server = http.createServer(app);
dotenv.config();
export const io = new Server(server, {
  cors: {
    origin: "'http://localhost:5173'",
    method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
});
app.use(express.json());
app.use(cookieParser());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

dbconnect(server);
app.use("/api", user);
app.use("/api/admin", admin);
app.use("/api/car", car);
app.use("/api/bookcar", Booking);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/invoices", express.static(path.join(__dirname, "invoices")));
