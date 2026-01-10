import { ExecuteResponse, ExecutionRequest, JestJSON } from "../types.js";
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

    // package.json for the test workspace
    const packageJson = {
      name: "user-submission",
      version: "1.0.0",
      type: "module",
      scripts: {
        test: "jest",
      },
      dependencies: {
        express: "^5.2.1",
        jsonwebtoken: "^9.0.2",
      },
      devDependencies: {
        "@types/express": "^5.0.0",
        "@types/jest": "^30.0.0",
        "@types/jsonwebtoken": "^9.0.7",
        "@types/supertest": "^6.0.3",
        jest: "^30.2.0",
        supertest: "^7.2.2",
        "ts-node": "^10.9.2",
        typescript: "^5.9.2",
      },
    };
    await fs.writeFile(
      path.join(workspace, "package.json"),
      JSON.stringify(packageJson, null, 2),
      "utf-8"
    );

    const jestConfig = `export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\\\.{1,2}/.*)\\\\.js$': '$1',
  },
  transform: {
    '^.+\\\\.tsx?$': ['ts-node', { useESM: true }],
  },
};`;
    await fs.writeFile(path.join(workspace, "jest.config.js"), jestConfig, "utf-8");

    const tsConfig = {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "bundler",
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
      },
    };
    await fs.writeFile(
      path.join(workspace, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2),
      "utf-8"
    );

    await copyTestFiles(payload.problem.slug, workspace);

    const jestResults = await runDocker(workspace, payload.testConfig.timeoutMs);
    const parsedResults = parseTestOutput(jestResults);

    const response: ExecuteResponse = {
      submissionId: payload.submissionId,
      status: jestResults.success ? "PASSED" : "FAILED",
      results: parsedResults,
      durationMs: Date.now() - start,
      stdout: `${jestResults.numPassedTests}/${jestResults.numTotalTests} tests passed`,
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

function parseTestOutput(JestJson: JestJSON): ExecuteResponse["results"] {
  const results: ExecuteResponse["results"] = [];

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
      });
    }
  }

  return results;
}

function sanitizeError(errorMessage: string): string {
  if (!errorMessage) return "";

  return errorMessage
    .split("\n")
    .filter((line) => !line.includes("node_modules") && !line.includes("jest-runtime"))
    .slice(0, 10)
    .join("\n");
}
