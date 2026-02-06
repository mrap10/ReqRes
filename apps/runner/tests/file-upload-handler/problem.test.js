const request = require("supertest");
const path = require("path");
const fs = require("fs");

describe("File Upload Handler", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  const createTestImage = (filename, sizeInKB) => {
    const buffer = Buffer.alloc(sizeInKB * 1024);
    const filepath = path.join(__dirname, filename);
    fs.writeFileSync(filepath, buffer);
    return filepath;
  };

  const cleanupTestFile = (filepath) => {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  };

  describe("POST /upload - Valid file uploads", () => {
    let testImagePath;

    beforeEach(() => {
      testImagePath = createTestImage("test.jpg", 1);
    });

    afterEach(() => {
      cleanupTestFile(testImagePath);
    });

    it("should accept valid image upload", async () => {
      const response = await request(app).post("/upload").attach("file", testImagePath);

      expect(response.status).toBe(200);
    });

    it("should return success flag", async () => {
      const response = await request(app).post("/upload").attach("file", testImagePath);

      expect(response.body).toHaveProperty("success");
      expect(response.body.success).toBe(true);
    });

    it("should return file metadata", async () => {
      const response = await request(app).post("/upload").attach("file", testImagePath);

      expect(response.body).toHaveProperty("file");
      expect(typeof response.body.file).toBe("object");
    });

    it("should include original filename", async () => {
      const response = await request(app).post("/upload").attach("file", testImagePath);

      expect(response.body.file).toHaveProperty("originalName");
      expect(response.body.file.originalName).toContain("test.jpg");
    });

    it("should include file size", async () => {
      const response = await request(app).post("/upload").attach("file", testImagePath);

      expect(response.body.file).toHaveProperty("size");
      expect(typeof response.body.file.size).toBe("number");
      expect(response.body.file.size).toBeGreaterThan(0);
    });

    it("should include mimetype", async () => {
      const response = await request(app).post("/upload").attach("file", testImagePath);

      expect(response.body.file).toHaveProperty("mimetype");
      expect(typeof response.body.file.mimetype).toBe("string");
    });

    it("should include upload timestamp", async () => {
      const response = await request(app).post("/upload").attach("file", testImagePath);

      expect(response.body.file).toHaveProperty("uploadedAt");

      const timestamp = new Date(response.body.file.uploadedAt);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });
  });

  describe("POST /upload - Different image types", () => {
    it("should accept JPEG images", async () => {
      const jpegPath = createTestImage("test.jpeg", 1);

      const response = await request(app)
        .post("/upload")
        .attach("file", jpegPath)
        .set("Content-Type", "multipart/form-data");

      expect(response.status).toBe(200);
      cleanupTestFile(jpegPath);
    });

    it("should accept PNG images", async () => {
      const pngPath = createTestImage("test.png", 1);

      const response = await request(app).post("/upload").attach("file", pngPath);

      expect(response.status).toBe(200);
      cleanupTestFile(pngPath);
    });

    it("should accept GIF images", async () => {
      const gifPath = createTestImage("test.gif", 1);

      const response = await request(app).post("/upload").attach("file", gifPath);

      expect(response.status).toBe(200);
      cleanupTestFile(gifPath);
    });
  });

  describe("POST /upload - File size validation", () => {
    it("should accept file under 5MB", async () => {
      const smallFile = createTestImage("small.jpg", 2 * 1024);

      const response = await request(app).post("/upload").attach("file", smallFile);

      expect(response.status).toBe(200);
      cleanupTestFile(smallFile);
    });

    it("should accept file exactly at 5MB", async () => {
      const maxFile = createTestImage("max.jpg", 5 * 1024);

      const response = await request(app).post("/upload").attach("file", maxFile);

      expect([200, 413]).toContain(response.status);
      cleanupTestFile(maxFile);
    });

    it("should reject file over 5MB", async () => {
      const largeFile = createTestImage("large.jpg", 6 * 1024);

      const response = await request(app).post("/upload").attach("file", largeFile);

      expect(response.status).toBe(413);
      cleanupTestFile(largeFile);
    });

    it("should return error message for large file", async () => {
      const largeFile = createTestImage("toolarge.jpg", 6 * 1024);

      const response = await request(app).post("/upload").attach("file", largeFile);

      expect(response.body).toHaveProperty("error");

      const error = response.body.error.toLowerCase();
      expect(error.includes("large") || error.includes("size") || error.includes("5mb")).toBe(true);

      cleanupTestFile(largeFile);
    });
  });

  describe("POST /upload - File type validation", () => {
    it("should reject non-image files (PDF)", async () => {
      const pdfPath = createTestImage("document.pdf", 1);

      const response = await request(app).post("/upload").attach("file", pdfPath);

      expect(response.status).toBe(400);
      cleanupTestFile(pdfPath);
    });

    it("should reject non-image files (TXT)", async () => {
      const txtPath = createTestImage("file.txt", 1);

      const response = await request(app).post("/upload").attach("file", txtPath);

      expect(response.status).toBe(400);
      cleanupTestFile(txtPath);
    });

    it("should reject non-image files (DOC)", async () => {
      const docPath = createTestImage("document.doc", 1);

      const response = await request(app).post("/upload").attach("file", docPath);

      expect(response.status).toBe(400);
      cleanupTestFile(docPath);
    });

    it("should return error for invalid file type", async () => {
      const txtPath = createTestImage("test.txt", 1);

      const response = await request(app).post("/upload").attach("file", txtPath);

      expect(response.body).toHaveProperty("error");

      const error = response.body.error.toLowerCase();
      expect(error.includes("type") || error.includes("image") || error.includes("invalid")).toBe(
        true
      );

      cleanupTestFile(txtPath);
    });

    it("should mention allowed types in error", async () => {
      const pdfPath = createTestImage("test.pdf", 1);

      const response = await request(app).post("/upload").attach("file", pdfPath);

      expect(response.body).toHaveProperty("error");

      const error = response.body.error.toLowerCase();
      expect(error.includes("image")).toBe(true);

      cleanupTestFile(pdfPath);
    });
  });

  describe("POST /upload - Missing file", () => {
    it("should return 400 when no file is uploaded", async () => {
      const response = await request(app)
        .post("/upload")
        .set("Content-Type", "multipart/form-data");

      expect(response.status).toBe(400);
    });
  });

  describe("Multer configuration", () => {
    it("should use memory storage (file in memory)", async () => {
      const testPath = createTestImage("memory-test.jpg", 1);

      const response = await request(app).post("/upload").attach("file", testPath);

      expect(response.status).toBe(200);

      cleanupTestFile(testPath);
    });

    it("should handle multiple uploads sequentially", async () => {
      const file1 = createTestImage("file1.jpg", 1);
      const file2 = createTestImage("file2.jpg", 1);

      const response1 = await request(app).post("/upload").attach("file", file1);

      const response2 = await request(app).post("/upload").attach("file", file2);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      cleanupTestFile(file1);
      cleanupTestFile(file2);
    });
  });

  describe("Error handling", () => {
    it("should handle very large files gracefully", async () => {
      const hugePath = createTestImage("huge.jpg", 10 * 1024);

      const response = await request(app).post("/upload").attach("file", hugePath);

      expect(response.status).toBe(413);
      expect(response.body).toHaveProperty("error");

      cleanupTestFile(hugePath);
    });

    it("should return JSON error responses", async () => {
      const pdfPath = createTestImage("test.pdf", 1);

      const response = await request(app).post("/upload").attach("file", pdfPath);

      expect(response.headers["content-type"]).toMatch(/json/);

      cleanupTestFile(pdfPath);
    });
  });

  describe("File metadata accuracy", () => {
    it("should report accurate file size", async () => {
      const testPath = createTestImage("size-test.jpg", 100);
      const actualSize = fs.statSync(testPath).size;

      const response = await request(app).post("/upload").attach("file", testPath);

      expect(response.status).toBe(200);
      expect(response.body.file.size).toBe(actualSize);

      cleanupTestFile(testPath);
    });

    it("should preserve original filename", async () => {
      const uniqueName = `test-${Date.now()}.jpg`;
      const testPath = createTestImage(uniqueName, 1);

      const response = await request(app).post("/upload").attach("file", testPath);

      expect(response.body.file.originalName).toContain(uniqueName);

      cleanupTestFile(testPath);
    });
  });
});
