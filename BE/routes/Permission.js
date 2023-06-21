import express from "express";
import { createPermission, getAllPermissions } from "../controllers/PermissionController.js";

const router = express.Router();

router.get("/", getAllPermissions);
router.post("/", createPermission);

export default router;