import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createMeeting,
  getMeetingStats,
  getUserSessions,
  getSessionDetails,
  getMeetingById,
} from "../controllers/meetingController.js";
const meetingRouter = express.Router();

meetingRouter.post("/", protect, createMeeting);
meetingRouter.post("/stats", protect, getMeetingStats);
meetingRouter.post("/sessions", protect, getUserSessions);
meetingRouter.post("/sessions/:id", protect, getSessionDetails);
meetingRouter.post("/meetingId", protect, getMeetingById);

export default meetingRouter;
