import express from "express";
const router = express.Router();
import {
  get_All_Groups,
  get_Group,
  delete_Group,
  update_Group,
  create_Group,
  addGroupStaff,
  removeGroupStaff,
} from "../controllers/GroupController.js";
import { VerifyToken } from "../middleware/auth.js";

router.put('/add-group-staff', VerifyToken, addGroupStaff);
router.put('/remove-group-staff', VerifyToken, removeGroupStaff);

router.get("/:id", VerifyToken, get_Group);

router.post("/", VerifyToken, create_Group);
router.get("/", VerifyToken, get_All_Groups);
router.delete("/:id", VerifyToken, delete_Group);
router.put("/:id", VerifyToken, update_Group);

export default router;
