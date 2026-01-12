const request = require("supertest");

let app;

beforeAll(() => {
  app = require("../../app").app;
});

describe("Rate Limiting Middleware", () => {
  it("allows requests under the limit", async () => {
    await request(app).get("/").expect(200);
    await request(app).get("/").expect(200);
    await request(app).get("/").expect(200);
  });

  it("blocks requests over the limit", async () => {
    await request(app).get("/").expect(429);
  });

  it("resets rate limit after window", async () => {
    await new Promise((resolve) => setTimeout(resolve, 11000));
    await request(app).get("/").expect(200);
  }, 15000);
});
