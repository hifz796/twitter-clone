import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Your frontend URL
    credentials: true
}));

app.use(express.json({ limit: '5mb' })); // For image uploads
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes); 
app.use("/api/notifications", notificationRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
    connectMongoDB();


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "Twitter backend is healthy",
    timestamp: new Date()
  });
});

});
