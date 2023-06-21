import express from "express";
const router = express.Router();
import {
  getAllChannel,
  addNotification,
  editNotification,
  sendSlackHr,
  sendSlackDayoff
} from "../controllers/SlackController.js";
import { VerifyToken } from "../middleware/auth.js";

router.get("/", VerifyToken, getAllChannel);
router.post("/", VerifyToken, addNotification);
router.put("/:id", VerifyToken, editNotification);
router.post("/sendHr", sendSlackHr);
router.post("/sendDayoff", sendSlackDayoff);


export default router;
