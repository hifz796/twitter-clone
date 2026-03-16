import express from "express";
import dotenv from "dotenv";

dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

/* ------------------ MIDDLEWARE ------------------ */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ------------------ CLOUDINARY ------------------ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ------------------ ROUTES ------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

/* ------------------ SERVE FRONTEND (PRODUCTION) ------------------ */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

/* ------------------ HEALTH CHECK ------------------ */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "Twitter clone backend is healthy",
    timestamp: new Date(),
  });
});

/* ------------------ START SERVER ------------------ */
const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();