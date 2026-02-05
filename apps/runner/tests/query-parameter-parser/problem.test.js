const request = require("supertest");

describe("Query Parameter Parser", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("GET /greet with valid parameters", () => {
    it("should return 200 status", async () => {
      const response = await request(app).get("/greet?name=Alice&age=25");
      expect(response.status).toBe(200);
    });

    it("should return JSON with message property", async () => {
      const response = await request(app).get("/greet?name=Alice&age=25");
      expect(response.body).toHaveProperty("message");
    });

    it("should include the name in the response", async () => {
      const response = await request(app).get("/greet?name=Alice&age=25");
      expect(response.body.message).toContain("Alice");
    });

    it("should include the age in the response", async () => {
      const response = await request(app).get("/greet?name=Bob&age=30");
      expect(response.body.message).toContain("30");
    });

    it("should include params object with name and age", async () => {
      const response = await request(app).get("/greet?name=Charlie&age=35");

      expect(response.body).toHaveProperty("params");
      expect(response.body.params).toHaveProperty("name");
      expect(response.body.params).toHaveProperty("age");
    });

    it("should handle different names correctly", async () => {
      const response1 = await request(app).get("/greet?name=John&age=25");
      const response2 = await request(app).get("/greet?name=Jane&age=25");

      expect(response1.body.message).toContain("John");
      expect(response2.body.message).toContain("Jane");
      expect(response1.body.message).not.toEqual(response2.body.message);
    });
  });

  describe("GET /greet with missing parameters", () => {
    it("should return 400 when name is missing", async () => {
      const response = await request(app).get("/greet?age=25");
      expect(response.status).toBe(400);
    });

    it("should return error message when name is missing", async () => {
      const response = await request(app).get("/greet?age=25");
      expect(response.body).toHaveProperty("error");

      const errorMsg = response.body.error.toLowerCase();
      expect(errorMsg).toContain("name");
    });

    it("should handle missing age gracefully (age is optional)", async () => {
      const response = await request(app).get("/greet?name=Alice");

      expect([200, 400]).toContain(response.status);
    });

    it("should return 400 when no parameters provided", async () => {
      const response = await request(app).get("/greet");
      expect(response.status).toBe(400);
    });
  });

  describe("Edge cases", () => {
    it("should handle special characters in name", async () => {
      const response = await request(app).get("/greet?name=Alice%20Smith&age=25");
      expect(response.status).toBe(200);
      expect(response.body.message).toBeTruthy();
    });

    it("should handle numeric age as string", async () => {
      const response = await request(app).get("/greet?name=Bob&age=30");
      expect(response.status).toBe(200);
      expect(["30", 30]).toContain(response.body.params.age);
    });
  });
});

// need to improvise, so that error messages are not too strict but still check for relevant info.
