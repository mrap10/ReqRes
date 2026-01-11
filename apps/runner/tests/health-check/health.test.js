const request = require("supertest");
const { app } = require("../../index");

describe("Health Check Endpoint", () => {
  it("should return status 200 and healthy message", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "healthy" });
  });
});
