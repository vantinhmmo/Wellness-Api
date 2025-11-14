import express from "express";
import { getAlbums } from "../controllers/album.controller.js";

const router = express.Router();

router.get("/", getAlbums);

export default router;
