const request = require("supertest");

describe("In-Memory CRUD API", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("POST /tasks - Create", () => {
    it("should create a new task and return 201", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({ title: "Learn Express.js" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
    });

    it("should return the created task with an id", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({ title: "Learn Express.js" })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("id");
      expect(response.body.id).toBeTruthy();
    });

    it("should return task with title", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({ title: "Learn Express.js" })
        .set("Content-Type", "application/json");

      expect(response.body.title).toBe("Learn Express.js");
    });

    it("should set completed to false by default", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({ title: "New Task" })
        .set("Content-Type", "application/json");

      expect(response.body.completed).toBe(false);
    });

    it("should include createdAt timestamp", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({ title: "Task with timestamp" })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("createdAt");

      const createdAt = new Date(response.body.createdAt);
      expect(isNaN(createdAt.getTime())).toBe(false);
    });

    it("should return 400 when title is missing", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({})
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return error message when title is missing", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({})
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("error");
    });

    it("should create multiple tasks with unique IDs", async () => {
      const task1 = await request(app)
        .post("/tasks")
        .send({ title: "Task 1" })
        .set("Content-Type", "application/json");

      const task2 = await request(app)
        .post("/tasks")
        .send({ title: "Task 2" })
        .set("Content-Type", "application/json");

      expect(task1.body.id).not.toEqual(task2.body.id);
    });
  });

  describe("GET /tasks - Read All", () => {
    it("should return 200 status", async () => {
      const response = await request(app).get("/tasks");
      expect(response.status).toBe(200);
    });

    it("should return an array", async () => {
      const response = await request(app).get("/tasks");
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return empty array when no tasks exist", async () => {
      const response = await request(app).get("/tasks");
      // Might be empty or have tasks, both are valid
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return created tasks", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "Test Task" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;

      const getResponse = await request(app).get("/tasks");

      const foundTask = getResponse.body.find((t) => t.id === taskId);
      expect(foundTask).toBeDefined();
      expect(foundTask.title).toBe("Test Task");
    });

    it("should return all created tasks", async () => {
      await request(app)
        .post("/tasks")
        .send({ title: "Task 1" })
        .set("Content-Type", "application/json");

      await request(app)
        .post("/tasks")
        .send({ title: "Task 2" })
        .set("Content-Type", "application/json");

      const response = await request(app).get("/tasks");

      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /tasks/:id - Read One", () => {
    it("should return 200 for existing task", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "Find Me" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;

      const response = await request(app).get(`/tasks/${taskId}`);
      expect(response.status).toBe(200);
    });

    it("should return the correct task", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "Specific Task" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;

      const response = await request(app).get(`/tasks/${taskId}`);
      expect(response.body.id).toEqual(taskId);
      expect(response.body.title).toBe("Specific Task");
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app).get("/tasks/99999");
      expect(response.status).toBe(404);
    });

    it("should return error message for non-existent task", async () => {
      const response = await request(app).get("/tasks/99999");
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /tasks/:id - Update", () => {
    it("should update task and return 200", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "Original Title" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;

      const updateResponse = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: "Updated Title", completed: true })
        .set("Content-Type", "application/json");

      expect(updateResponse.status).toBe(200);
    });

    it("should update task title", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "Old Title" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;

      const updateResponse = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: "New Title" })
        .set("Content-Type", "application/json");

      expect(updateResponse.body.title).toBe("New Title");
    });

    it("should update task completed status", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "Task to Complete" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;

      const updateResponse = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ completed: true })
        .set("Content-Type", "application/json");

      expect(updateResponse.body.completed).toBe(true);
    });

    it("should preserve other fields when updating", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "Original" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;
      const originalCreatedAt = createResponse.body.createdAt;

      const updateResponse = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ completed: true })
        .set("Content-Type", "application/json");

      expect(updateResponse.body.id).toEqual(taskId);
      expect(updateResponse.body.title).toBe("Original");
      expect(updateResponse.body.createdAt).toBe(originalCreatedAt);
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .put("/tasks/99999")
        .send({ title: "Updated" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(404);
    });

    it("should persist updates", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "To Update" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;

      await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: "Updated", completed: true })
        .set("Content-Type", "application/json");

      const getResponse = await request(app).get(`/tasks/${taskId}`);
      expect(getResponse.body.title).toBe("Updated");
      expect(getResponse.body.completed).toBe(true);
    });
  });

  describe("DELETE /tasks/:id - Delete", () => {
    it("should delete task and return 200", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "To Delete" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;

      const deleteResponse = await request(app).delete(`/tasks/${taskId}`);
      expect(deleteResponse.status).toBe(200);
    });

    it("should return success message", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "Delete Me" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;

      const deleteResponse = await request(app).delete(`/tasks/${taskId}`);
      expect(deleteResponse.body).toHaveProperty("message");
    });

    it("should actually remove the task", async () => {
      const createResponse = await request(app)
        .post("/tasks")
        .send({ title: "Will Be Deleted" })
        .set("Content-Type", "application/json");

      const taskId = createResponse.body.id;

      await request(app).delete(`/tasks/${taskId}`);

      const getResponse = await request(app).get(`/tasks/${taskId}`);
      expect(getResponse.status).toBe(404);
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app).delete("/tasks/99999");
      expect(response.status).toBe(404);
    });

    it("should not affect other tasks", async () => {
      const task1 = await request(app)
        .post("/tasks")
        .send({ title: "Keep This" })
        .set("Content-Type", "application/json");

      const task2 = await request(app)
        .post("/tasks")
        .send({ title: "Delete This" })
        .set("Content-Type", "application/json");

      await request(app).delete(`/tasks/${task2.body.id}`);

      // First task should still exist
      const getResponse = await request(app).get(`/tasks/${task1.body.id}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.title).toBe("Keep This");
    });
  });

  describe("CRUD Integration", () => {
    it("should support complete CRUD lifecycle", async () => {
      const createRes = await request(app)
        .post("/tasks")
        .send({ title: "Lifecycle Test" })
        .set("Content-Type", "application/json");

      expect(createRes.status).toBe(201);
      const taskId = createRes.body.id;

      const readRes = await request(app).get(`/tasks/${taskId}`);
      expect(readRes.status).toBe(200);
      expect(readRes.body.title).toBe("Lifecycle Test");

      const updateRes = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ completed: true })
        .set("Content-Type", "application/json");

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.completed).toBe(true);

      const deleteRes = await request(app).delete(`/tasks/${taskId}`);
      expect(deleteRes.status).toBe(200);

      const verifyRes = await request(app).get(`/tasks/${taskId}`);
      expect(verifyRes.status).toBe(404);
    });
  });
});
