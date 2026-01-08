import { ExecuteResponse, ExecutionRequest } from "../types.js";
import { createTempDir } from "../utils/tempDir.js";
import path from "path";
import fs from "fs/promises";
import { cleanupDir } from "../utils/cleanup.js";
import axios from "axios";

export async function runExecution(payload: ExecutionRequest): Promise<ExecuteResponse> {
  const start = Date.now();
  const workspace = await createTempDir();

  try {
    for (const [filePath, content] of Object.entries(payload.codeBundle.files)) {
      const fullPath = path.join(workspace, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, "utf-8");
    }

    // stubbed for now
    await new Promise((r) => setTimeout(r, 500));

    const results = [{ name: "Health Check", passed: true }];

    const response: ExecuteResponse = {
      submissionId: payload.submissionId,
      status: "PASSED",
      results,
      durationMs: Date.now() - start,
      stdout: "Simulation complete.",
      stderr: "",
    };

    await axios.post(process.env.API_CALLBACK_URL!, response, {
      headers: {
        "x-runner-secret": process.env.RUNNER_SHARED_SECRET!,
      },
    });

    return response;
  } catch (error) {
    const response: ExecuteResponse = {
      submissionId: payload.submissionId,
      status: "ERROR",
      results: [],
      durationMs: Date.now() - start,
      stderr: String(error),
    };

    await axios.post(process.env.API_CALLBACK_URL!, response, {
      headers: {
        "x-runner-secret": process.env.RUNNER_SHARED_SECRET!,
      },
    });

    return response;
  } finally {
    await cleanupDir(workspace);
  }
}
