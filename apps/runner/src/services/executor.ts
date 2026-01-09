import { ExecuteResponse, ExecutionRequest } from "../types.js";
import { createTempDir } from "../utils/tempDir.js";
import path from "path";
import fs from "fs/promises";
import { cleanupDir } from "../utils/cleanup.js";
import axios from "axios";
import { runDocker } from "./dockerRun.js";

export async function runExecution(payload: ExecutionRequest): Promise<ExecuteResponse> {
  const start = Date.now();
  const workspace = await createTempDir();

  try {
    for (const [filePath, content] of Object.entries(payload.codeBundle.files)) {
      const fullPath = path.join(workspace, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, "utf-8");

      await fs.mkdir(path.join(workspace, "tests"), { recursive: true });
      await fs.copyFile(
        path.join(__dirname, "../../tests/health-check/health.test.ts"),
        path.join(workspace, "tests/health.test.ts")
      );
    }

    const output = await runDocker(workspace, payload.testConfig.timeoutMs);

    const response: ExecuteResponse = {
      submissionId: payload.submissionId,
      status: "PASSED",
      results: parseTestOutput(output),
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

function parseTestOutput(output: { stdout: string; stderr: string }): ExecuteResponse["results"] {
  // just a placeholder implementation, should parse actual test results
  const hasOutput = output.stdout.length > 0 || output.stderr.length > 0;
  return hasOutput ? [{ name: "sample", passed: true, error: output.stdout }] : [];
}
