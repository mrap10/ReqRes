const request = require("supertest");

describe("Custom Error Handler", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("GET /success route", () => {
    it("should return 200 status", async () => {
      const response = await request(app).get("/success");
      expect(response.status).toBe(200);
    });

    it("should return success message", async () => {
      const response = await request(app).get("/success");
      expect(response.body).toHaveProperty("message");

      const message = response.body.message.toLowerCase();
      expect(message).toContain("success");
    });

    it("should return JSON response", async () => {
      const response = await request(app).get("/success");
      expect(response.headers["content-type"]).toMatch(/json/);
    });
  });

  describe("GET /error route with error handler", () => {
    it("should catch errors and return error response", async () => {
      const response = await request(app).get("/error");

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should return 500 status for server errors", async () => {
      const response = await request(app).get("/error");
      expect(response.status).toBe(500);
    });

    it("should return error object", async () => {
      const response = await request(app).get("/error");
      expect(response.body).toHaveProperty("error");
    });

    it("should include error message", async () => {
      const response = await request(app).get("/error");

      // Error can be nested or direct
      const errorObj = response.body.error;

      expect(errorObj.message || errorObj.error || typeof errorObj === "string").toBeTruthy();
    });

    it("should include status code in error response", async () => {
      const response = await request(app).get("/error");

      // Status can be in error object or in HTTP response
      const hasStatus =
        response.body.error?.status || response.body.status || response.status >= 400;

      expect(hasStatus).toBeTruthy();
    });

    it("should include timestamp in error response", async () => {
      const response = await request(app).get("/error");

      const hasTimestamp = response.body.error?.timestamp || response.body.timestamp;

      expect(hasTimestamp).toBeTruthy();

      if (hasTimestamp) {
        const date = new Date(hasTimestamp);
        expect(isNaN(date.getTime())).toBe(false);
      }
    });
  });

  describe("Error handler middleware", () => {
    it("should format errors consistently", async () => {
      const response = await request(app).get("/error");

      expect(response.body).toBeTruthy();
      expect(typeof response.body).toBe("object");
    });

    it("should not expose stack traces in production", async () => {
      const response = await request(app).get("/error");

      // Stack trace should not be in response body
      const bodyStr = JSON.stringify(response.body).toLowerCase();
      expect(bodyStr).not.toContain("stack");
    });

    it("should handle errors without crashing", async () => {
      const response1 = await request(app).get("/error");
      const response2 = await request(app).get("/error");

      expect(response1.status).toBe(500);
      expect(response2.status).toBe(500);

      const successResponse = await request(app).get("/success");
      expect(successResponse.status).toBe(200);
    });
  });

  describe("Non-existent routes", () => {
    it("should handle 404 errors gracefully", async () => {
      const response = await request(app).get("/nonexistent");

      expect([404, 500]).toContain(response.status);
    });
  });
});
