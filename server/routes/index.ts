import express, { Router } from "express";
import songRoutes from "./song.routes";

const router = Router();

router.use("/song", songRoutes);

export default router;
