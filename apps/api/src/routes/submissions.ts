import { Router } from "express";
import { requireAuth, requireOwnership, requireSubmissionOwnership } from "../middleware/auth.js";
import * as submissionsController from "../controllers/submissions.controller.js";

const router = Router();

router.post("/", requireAuth, submissionsController.createSubmission);

router.get(
  "/user/:userId",
  requireAuth,
  requireOwnership("userId"),
  submissionsController.getUserSubmissions
);

router.get("/leaderboard", submissionsController.getLeaderboard);

router.get(
  "/:id",
  requireAuth,
  requireSubmissionOwnership,
  submissionsController.getSubmissionById
);

router.get(
  "/:id/logs",
  requireAuth,
  requireSubmissionOwnership,
  submissionsController.getSubmissionLogs
);

export default router;
