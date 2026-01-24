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

router.get(
  "/:id/stream",
  requireAuth,
  requireSubmissionOwnership,
  submissionsController.streamSubmissionStatus
);

export default router;
// todo: add bull board for queue monitoring by admin only (will do after initiating admin workflows) with grafana, datadog, etc
