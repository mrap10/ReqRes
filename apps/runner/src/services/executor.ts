import { ExecuteResponse, ExecutionRequest } from "../types.js";
import { createTempDir } from "../utils/tempDir.js";
import path from "path";
import fs from "fs/promises";
import { cleanupDir } from "../utils/cleanup.js";
import axios from "axios";
import { runDocker } from "./dockerRun.js";

const TESTS_BASE_DIR = path.join(__dirname, "../../tests");

// whitelisting for now (will replace it with dynamic check later in v1)
const ALLOWED_PROBLEM_SLUGS = new Set([
  "health-check",
  "jwt-auth",
  // new problem slugs here
]);

async function copyTestFiles(problemSlug: string, workspace: string): Promise<void> {
  if (!ALLOWED_PROBLEM_SLUGS.has(problemSlug)) {
    throw new Error(`Unknown problem slug: ${problemSlug}`);
  }

  const sanitizedSlug = path.basename(problemSlug);
  const testSourceDir = path.join(TESTS_BASE_DIR, sanitizedSlug);
  const testDestDir = path.join(workspace, "tests");

  try {
    await fs.access(testSourceDir);
  } catch {
    throw new Error(`Test suite not found for problem: ${problemSlug}`);
  }

  await fs.mkdir(testDestDir, { recursive: true });

  const files = await fs.readdir(testSourceDir);
  for (const file of files) {
    const srcPath = path.join(testSourceDir, file);
    const destPath = path.join(testDestDir, file);

    const stat = await fs.stat(srcPath);
    if (stat.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function runExecution(payload: ExecutionRequest): Promise<ExecuteResponse> {
  const start = Date.now();
  const workspace = await createTempDir();

  try {
    for (const [filePath, content] of Object.entries(payload.codeBundle.files)) {
      const fullPath = path.join(workspace, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, "utf-8");
    }

    await copyTestFiles(payload.problem.slug, workspace);

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
