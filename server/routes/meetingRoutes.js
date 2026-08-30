import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createMeeting,
  getMeetingStats,
  getUserSessions,
  getSessionDetails,
  getMeetingById,
} from '../controllers/meetingController.js';
const meetingRouter = express.Router();

meetingRouter.post('/', protect, createMeeting);
meetingRouter.get('/stats', protect, getMeetingStats);
meetingRouter.get('/sessions', protect, getUserSessions);
meetingRouter.get('/sessions/:id', protect, getSessionDetails);
meetingRouter.get('/:meetingId', protect, getMeetingById);

export default meetingRouter;
