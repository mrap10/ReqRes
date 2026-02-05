const request = require("supertest");

describe("Request Logger Middleware", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("Logging functionality", () => {
    it("should have /logs endpoint", async () => {
      const response = await request(app).get("/logs");
      expect(response.status).toBe(200);
    });

    it("should return an array of logs", async () => {
      const response = await request(app).get("/logs");
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should log GET /api/users requests", async () => {
      // triggering logging
      await request(app).get("/api/users");

      const logsResponse = await request(app).get("/logs");
      const logs = logsResponse.body;

      const userLog = logs.find((log) => log.url && log.url.includes("/api/users"));

      expect(userLog).toBeDefined();
      expect(userLog.method).toBe("GET");
    });

    it("should log POST /api/users requests", async () => {
      await request(app)
        .post("/api/users")
        .send({ name: "Test" })
        .set("Content-Type", "application/json");

      const logsResponse = await request(app).get("/logs");
      const logs = logsResponse.body;

      const postLog = logs.find(
        (log) => log.method === "POST" && log.url && log.url.includes("/api/users")
      );

      expect(postLog).toBeDefined();
    });

    it("should include method in log entry", async () => {
      await request(app).get("/api/users");

      const logsResponse = await request(app).get("/logs");
      const logs = logsResponse.body;

      const log = logs.find((l) => l.url && l.url.includes("/api/users"));
      expect(log).toHaveProperty("method");
      expect(typeof log.method).toBe("string");
    });

    it("should include URL in log entry", async () => {
      await request(app).get("/api/users");

      const logsResponse = await request(app).get("/logs");
      const logs = logsResponse.body;

      const log = logs.find((l) => l.url && l.url.includes("/api/users"));
      expect(log).toHaveProperty("url");
      expect(typeof log.url).toBe("string");
    });

    it("should include response time in log entry", async () => {
      await request(app).get("/api/users");

      const logsResponse = await request(app).get("/logs");
      const logs = logsResponse.body;

      const log = logs.find((l) => l.url && l.url.includes("/api/users"));
      expect(log).toHaveProperty("responseTime");
      expect(typeof log.responseTime).toBe("number");
      expect(log.responseTime).toBeGreaterThanOrEqual(0);
    });

    it("should measure response time accurately", async () => {
      await request(app).get("/api/users");

      const logsResponse = await request(app).get("/logs");
      const logs = logsResponse.body;

      const log = logs.find((l) => l.url && l.url.includes("/api/users"));

      // Response time should be reasonable (less than 1 second for simple endpoint)
      expect(log.responseTime).toBeLessThan(1000);
    });
  });

  describe("API endpoints", () => {
    it("GET /api/users should return 200", async () => {
      const response = await request(app).get("/api/users");
      expect(response.status).toBe(200);
    });

    it("GET /api/users should return JSON", async () => {
      const response = await request(app).get("/api/users");
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    it("GET /api/users should return users array", async () => {
      const response = await request(app).get("/api/users");
      expect(response.body).toHaveProperty("users");
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it("POST /api/users should return 200", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({ name: "John" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    it("POST /api/users should return created confirmation", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({ name: "Jane" })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("created");
      expect(response.body.created).toBe(true);
    });
  });

  describe("Middleware behavior", () => {
    it("should log multiple requests", async () => {
      await request(app).get("/api/users");
      await request(app).post("/api/users").send({ name: "Test" });
      await request(app).get("/api/users");

      const logsResponse = await request(app).get("/logs");
      const logs = logsResponse.body;

      // Should have at least 3 logs (not counting the /logs request itself)
      const apiLogs = logs.filter((l) => l.url && l.url.includes("/api"));
      expect(apiLogs.length).toBeGreaterThanOrEqual(3);
    });

    it("should not interfere with response data", async () => {
      const response = await request(app).get("/api/users");

      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
    });
  });

  describe("Log storage", () => {
    it("should persist logs across requests", async () => {
      await request(app).get("/api/users");

      const logs1 = await request(app).get("/logs");
      const count1 = logs1.body.filter((l) => l.url && l.url.includes("/api")).length;

      await request(app).get("/api/users");

      const logs2 = await request(app).get("/logs");
      const count2 = logs2.body.filter((l) => l.url && l.url.includes("/api")).length;

      expect(count2).toBeGreaterThan(count1);
    });
  });
});
