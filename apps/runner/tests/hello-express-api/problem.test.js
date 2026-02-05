const request = require("supertest");

describe("Hello Express API", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();

    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  it("should respond to GET / with status 200", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });

  it("should return JSON content type", async () => {
    const response = await request(app).get("/");
    expect(response.headers["content-type"]).toMatch(/json/);
  });

  it("should return an object with a message property", async () => {
    const response = await request(app).get("/");
    expect(response.body).toHaveProperty("message");
    expect(typeof response.body.message).toBe("string");
  });

  it("should return a welcome message", async () => {
    const response = await request(app).get("/");
    const message = response.body.message.toLowerCase();

    expect(
      message.includes("hello") || message.includes("welcome") || message.includes("express")
    ).toBe(true);
  });

  it("should not have app.listen() called", () => {
    // module should export the app, not a server instance
    const userSolution = require("../../index");
    const exported = userSolution.app || userSolution;

    // Should be Express app, not HTTP server
    expect(typeof exported).toBe("function");
    expect(exported.listen).toBeDefined();
  });
});
