import request from "supertest";
import { app } from "../../index.js";

describe("Health Check Endpoint", () => {
  it("should return status 200 and healthy message", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "healthy" });
  });
});
