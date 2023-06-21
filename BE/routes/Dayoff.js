import express from "express";
import {
  Get_All_DayOff,
  Get_Information_Request,
  Revert_DayOff,
  delete_DayOff,
} from "../controllers/DayoffController.js";
import { VerifyToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/", VerifyToken, Get_All_DayOff);
router.get("/:id", VerifyToken, Get_Information_Request);
router.post("/:id", VerifyToken, Revert_DayOff);
router.delete("/:id", VerifyToken, delete_DayOff);

export default router;
