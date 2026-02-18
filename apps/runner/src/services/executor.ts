import { ExecuteResponse, ExecutionRequest, JestJSON } from "../types.js";
import { createTempDir } from "../utils/tempDir.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { cleanupDir } from "../utils/cleanup.js";
import axios from "axios";
import { runDocker } from "./dockerRun.js";
import { executorLogger } from "../lib/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TESTS_BASE_DIR = path.join(__dirname, "../../tests");

// whitelisting for now (will replace it with dynamic check later in v1)
const ALLOWED_PROBLEM_SLUGS = new Set([
  "hello-express-api",
  "query-parameter-parser",
  "request-body-parser",
  "custom-error-handler",
  "path-parameters",
  "request-logger-middleware",
  "in-memory-crud-api",
  "jwt-authentication-middleware",
  "input-validation-middleware",
  "file-upload-handler",
  "api-versioning",
  "cors-configuration",
  "jwt-with-refresh-tokens",
  "graphql-like-query-api",
]);

async function emitLog(
  submissionId: string,
  level: "info" | "error" | "warn",
  message: string
): Promise<void> {
  axios
    .post(
      `${process.env.API_CALLBACK_URL!.replace("/result", "/log")}`,
      { submissionId, level, message },
      {
        headers: { "x-runner-secret": process.env.RUNNER_SHARED_SECRET! },
        timeout: 3000,
      }
    )
    .catch((err) => {
      console.error("Failed to emit log:", err);
    });
}

async function copyTestFiles(problemSlug: string, workspace: string): Promise<boolean> {
  if (!ALLOWED_PROBLEM_SLUGS.has(problemSlug)) {
    throw new Error(`Unknown problem slug: ${problemSlug}`);
  }

  const sanitizedSlug = path.basename(problemSlug);
  const testSourceDir = path.join(TESTS_BASE_DIR, sanitizedSlug);
  const testDestDir = path.join(workspace, "tests", sanitizedSlug);

  try {
    await fs.access(testSourceDir);
  } catch {
    throw new Error(`Test suite not found for problem: ${problemSlug}`);
  }

  await fs.mkdir(testDestDir, { recursive: true });

  let hasSetupFile = false;
  const files = await fs.readdir(testSourceDir);
  for (const file of files) {
    const srcPath = path.join(testSourceDir, file);
    const destPath = path.join(testDestDir, file);

    const stat = await fs.stat(srcPath);
    if (stat.isFile()) {
      await fs.copyFile(srcPath, destPath);
      if (file === "setup.js") {
        hasSetupFile = true;
      }
    }
  }

  return hasSetupFile;
}

export async function runExecution(payload: ExecutionRequest): Promise<ExecuteResponse> {
  const start = Date.now();
  const workspace = await createTempDir();
  const execLogger = executorLogger.child({
    submissionId: payload.submissionId,
    problemSlug: payload.problem.slug,
  });

  execLogger.debug({ workspace }, "Created temporary workspace");

  try {
    emitLog(payload.submissionId, "info", "Preparing execution environment");

    for (const [filePath, content] of Object.entries(payload.codeBundle.files)) {
      if (filePath.endsWith(".ts")) {
        throw new Error("TypeScript files are not supported in this runner version.");
      }
      const fullPath = path.join(workspace, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, "utf-8");
    }

    emitLog(payload.submissionId, "info", "Setting up test environment");

    // package.json for the test workspace
    const packageJson = {
      name: "user-submission",
      version: "1.0.0",
      scripts: {
        test: "jest --runInBand",
      },
      dependencies: {
        express: "^5.2.1",
        jsonwebtoken: "^9.0.2",
      },
    };
    await fs.writeFile(
      path.join(workspace, "package.json"),
      JSON.stringify(packageJson, null, 2),
      "utf-8"
    );

    const hasSetupFile = await copyTestFiles(payload.problem.slug, workspace);

    const isRunMode = payload.mode === "run";
    const RUN_MODE_MAX_TESTS = 2;

    const setupFiles: string[] = [];
    if (hasSetupFile) {
      setupFiles.push(`'<rootDir>/tests/${payload.problem.slug}/setup.js'`);
    }

    const jestConfig = `
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  ${setupFiles.length > 0 ? `setupFilesAfterEnv: [${setupFiles.join(", ")}],` : ""}
};
`;
    await fs.writeFile(path.join(workspace, "jest.config.js"), jestConfig, "utf-8");

    if (isRunMode) {
      emitLog(payload.submissionId, "info", `Running ${RUN_MODE_MAX_TESTS} sample tests`);
    } else {
      emitLog(
        payload.submissionId,
        "info",
        "Running full test suite - this migght take a moment for larger problems"
      );
    }

    if (payload.problem.slug === "rate-limiting-middleware") {
      emitLog(
        payload.submissionId,
        "info",
        "Applying rate-limit logic to your middleware implementation"
      );
    }

    execLogger.info("Starting container execution");

    const jestResults = await runDocker(workspace, payload.testConfig.timeoutMs, payload.mode);

    execLogger.info(
      {
        passed: jestResults.numPassedTests,
        failed: jestResults.numFailedTests,
        total: jestResults.numTotalTests,
      },
      "Docker execution completed"
    );

    emitLog(payload.submissionId, "info", "Evaluating results");

    const parsedResults = parseTestOutput(jestResults);

    const reportedResults = isRunMode ? parsedResults.slice(0, RUN_MODE_MAX_TESTS) : parsedResults;

    const passedCount = reportedResults.filter((r) => r.passed).length;
    const totalCount = reportedResults.length;
    const allPassed = isRunMode
      ? reportedResults.length > 0 && reportedResults.every((r) => r.passed)
      : jestResults.success;

    emitLog(
      payload.submissionId,
      allPassed ? "info" : "error",
      allPassed
        ? `All tests passed (${passedCount}/${totalCount})`
        : `Tests completed: ${passedCount}/${totalCount} passed`
    );

    const response: ExecuteResponse = {
      submissionId: payload.submissionId,
      status: allPassed ? "PASSED" : "FAILED",
      results: reportedResults,
      durationMs: Date.now() - start,
      stdout: `${passedCount}/${totalCount} tests passed`,
      stderr: "",
      mode: payload.mode || "submit",
    };

    await axios.post(process.env.API_CALLBACK_URL!, response, {
      headers: {
        "x-runner-secret": process.env.RUNNER_SHARED_SECRET!,
      },
    });

    execLogger.info(
      { status: response.status, durationMs: response.durationMs },
      "Execution result sent to API"
    );

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    execLogger.error({ error: errorMessage }, "Execution failed");
    emitLog(payload.submissionId, "error", `Execution failed: ${errorMessage}`);
    emitLog(payload.submissionId, "error", "0 test cases passed due to error");

    const response: ExecuteResponse = {
      submissionId: payload.submissionId,
      status: "ERROR",
      results: [],
      durationMs: Date.now() - start,
      stderr: errorMessage,
      mode: payload.mode || "submit",
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

function parseTestOutput(JestJson: JestJSON): ExecuteResponse["results"] {
  const results: ExecuteResponse["results"] = [];
  let testIndex = 0;

  for (const testSuite of JestJson.testResults) {
    for (const assertion of testSuite.assertionResults) {
      // Build full test name including describe blocks
      const fullTestName =
        assertion.ancestorTitles.length > 0
          ? `${assertion.ancestorTitles.join(" > ")} > ${assertion.title}`
          : assertion.title;

      results.push({
        name: fullTestName,
        passed: assertion.status === "passed",
        error:
          assertion.status === "failed"
            ? sanitizeError(assertion.failureMessages.join("\n"))
            : undefined,
        index: testIndex,
        location: assertion.location,
      });
      testIndex++;
    }
  }

  return results;
}

function sanitizeError(errorMessage: string): string {
  if (!errorMessage) return "";

  return errorMessage
    .split("\n")
    .filter((line) => {
      return (
        !line.includes("node_modules") &&
        !line.includes("jest-runtime") &&
        !line.includes("at Object.require") &&
        !line.includes("at new Promise") &&
        !line.trim().startsWith("at ") // stack trace lines
      );
    })
    .slice(0, 5)
    .join("\n")
    .trim();
}
