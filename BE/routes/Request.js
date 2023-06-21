import express from "express";
import {
  Get_All_Request,
  Create_Request,
  Update_Request,
  Delete_Request,
  Get_Request_Detail,
  countRequestsByStatus,
  countRequestsByMonth,
  countRequestsByDayOffSession,
  getAllRequestInBelongedGroups,
  approveRequest,
  rejectRequest,
} from "../controllers/RequestDetailController.js";
import { VerifyToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/get-all-requests-in-user-groups", VerifyToken, getAllRequestInBelongedGroups);
router.put("/approve", VerifyToken, approveRequest);
router.put("/reject", VerifyToken, rejectRequest);

router.get("/count-requests-by-status", VerifyToken, countRequestsByStatus);
router.get("/count-requests-by-month", VerifyToken, countRequestsByMonth);
router.get("/count-requests-by-day-off-session", VerifyToken, countRequestsByDayOffSession)

router.get("/:id",VerifyToken, Get_Request_Detail);
router.get("/", Get_All_Request);
router.post("/", VerifyToken, Create_Request);
router.put("/:id",VerifyToken, Update_Request);
router.delete("/:id",VerifyToken, Delete_Request);


export default router;
