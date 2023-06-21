import express from "express";
const router = express.Router();
import { VerifyToken } from "../middleware/auth.js";
import { getRequestHistory } from "../controllers/RequestHistoryController.js";

router.get("/:id", VerifyToken, getRequestHistory);

export default router;
