import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import albumRoutes from "./routes/album.routes.js";
import userRoutes from "./routes/user.routes.js";
import wellnessRoutes from "./routes/wellness.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err.message));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wellness", wellnessRoutes);

export default app;
