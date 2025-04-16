import express from "express";
const router = express.Router();
import loginAdmin from "../Controller/Adminlogin.js";
import {
  Adminview,
  BanShowroom,
  Show_BanShow_Room,
  Active_Show_Room,
} from "../Controller/Adminview.js";
import {
  approveShowroom,
  getPendingShowrooms,
} from "../Controller/Adminview.js";
import { isShowroomApproved } from "../Middleware/verifyShowRoomStauts.js";
router.post("/login", loginAdmin);
router.get("/adminview", Adminview);
router.post("/banshowroom/:showroomid", BanShowroom);
router.get("/viewBanUser", Show_BanShow_Room);
router.patch("/activeshowroom", Active_Show_Room);
router.get("/pending-approver-showrooms", getPendingShowrooms);
router.put("/approve/:id", approveShowroom);
export default router;
