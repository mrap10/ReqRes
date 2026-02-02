export const problems = [
  {
    title: "Hello Express API",
    slug: "hello-express-api",
    difficulty: "EASY",
    track: "ROUTING",
    shortDescription: "Create your first Express server with a simple GET endpoint.",
    description:
      "Build a basic Express server that responds to a GET request at the root path. This is your introduction to Express routing and response handling.",
    instructions: `### Requirements
- Create an Express server
- Implement a \`GET /\` route
- Return a JSON response with a welcome message
- Export the Express app (do NOT call \`app.listen()\`)

### Expected Response
\`\`\`json
{
  "message": "Hello, Express!"
}
\`\`\``,
    starterCode: `const express = require('express');
const app = express();

// TODO: Implement GET / route

module.exports = app;
`,
    constraints: [
      "No app.listen()",
      "Export Express app",
      "Return JSON response",
      "Use GET method",
    ],
    tags: ["basics", "routing", "json"],
    testConfig: {
      timeoutMs: 30000,
      memoryMb: 256,
    },
    examples: {
      request: {
        method: "GET",
        url: "http://localhost:3000/",
        headers: {},
        curl: "curl -X GET http://localhost:3000/",
      },
      response: {
        success: {
          status: "HTTP/1.1 200 OK",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            message: "Hello, Express!",
          },
        },
      },
    },
    isPublished: true,
    submissionType: "EXPRESS_API",
  },
  {
    title: "Query Parameter Parser",
    slug: "query-parameter-parser",
    difficulty: "EASY",
    track: "ROUTING",
    shortDescription: "Parse and validate URL query parameters.",
    description:
      "Create an endpoint that accepts query parameters and returns them in a structured format. Learn how Express handles query strings and basic input validation.",
    instructions: `### Requirements
- Implement \`GET /greet\` endpoint
- Accept \`name\` and \`age\` as query parameters
- Return a personalized greeting
- Handle missing parameters gracefully

### Example Request
\`\`\`
GET /greet?name=Alice&age=25
\`\`\`

### Expected Response
\`\`\`json
{
  "message": "Hello, Alice! You are 25 years old.",
  "params": {
    "name": "Alice",
    "age": "25"
  }
}
\`\`\`

### Error Handling
If \`name\` is missing, return \`400\`:
\`\`\`json
{
  "error": "Name parameter is required"
}
\`\`\``,
    starterCode: `const express = require('express');
const app = express();

// TODO: Implement GET /greet route with query parameter handling

module.exports = app;
`,
    constraints: [
      "No app.listen()",
      "Export Express app",
      "Handle missing parameters",
      "Return appropriate status codes",
    ],
    tags: ["query-params", "validation", "routing"],
    testConfig: {
      timeoutMs: 30000,
      memoryMb: 256,
    },
    examples: {
      request: {
        method: "GET",
        url: "http://localhost:3000/greet?name=Alice&age=25",
        headers: {},
        curl: "curl -X GET 'http://localhost:3000/greet?name=Alice&age=25'",
      },
      response: {
        success: {
          status: "HTTP/1.1 200 OK",
          body: {
            message: "Hello, Alice! You are 25 years old.",
            params: {
              name: "Alice",
              age: "25",
            },
          },
        },
        error: {
          status: "HTTP/1.1 400 Bad Request",
          body: {
            error: "Name parameter is required",
          },
          example: {
            url: "http://localhost:3000/greet?age=25",
            curl: "curl -X GET 'http://localhost:3000/greet?age=25'",
          },
        },
      },
    },
    isPublished: true,
    submissionType: "EXPRESS_API",
  },
  {
    title: "Path Parameters",
    slug: "path-parameters",
    difficulty: "EASY",
    track: "ROUTING",
    shortDescription: "Extract and use URL path parameters in routes.",
    description:
      "Create RESTful routes that use path parameters to identify resources. Learn how to work with dynamic route segments in Express.",
    instructions: `### Requirements
- Implement \`GET /users/:id\` endpoint
- Extract the \`id\` from the URL path
- Return user information based on the ID
- Handle invalid IDs appropriately

### Example Requests
\`\`\`bash
GET /users/123
GET /users/456
\`\`\`

### Expected Response (200 OK)
\`\`\`json
{
  "id": "123",
  "message": "User profile for ID: 123"
}
\`\`\`

### Additional Challenge
Implement \`GET /posts/:postId/comments/:commentId\` to practice nested path parameters.

Expected response:
\`\`\`json
{
  "postId": "10",
  "commentId": "5",
  "message": "Comment 5 on Post 10"
}
\`\`\``,
    starterCode: `const express = require('express');
const app = express();

// TODO: Implement routes with path parameters

module.exports = app;
`,
    constraints: [
      "No app.listen()",
      "Export Express app",
      "Use path parameters",
      "Return JSON responses",
    ],
    tags: ["routing", "path-params", "rest-api"],
    testConfig: {
      timeoutMs: 30000,
      memoryMb: 256,
    },
    examples: {
      request: {
        simple: {
          method: "GET",
          url: "http://localhost:3000/users/123",
          curl: "curl -X GET http://localhost:3000/users/123",
        },
        nested: {
          method: "GET",
          url: "http://localhost:3000/posts/10/comments/5",
          curl: "curl -X GET http://localhost:3000/posts/10/comments/5",
        },
      },
      response: {
        simple: {
          status: "HTTP/1.1 200 OK",
          body: {
            id: "123",
            message: "User profile for ID: 123",
          },
        },
        nested: {
          status: "HTTP/1.1 200 OK",
          body: {
            postId: "10",
            commentId: "5",
            message: "Comment 5 on Post 10",
          },
        },
      },
    },
    isPublished: true,
    submissionType: "EXPRESS_API",
  },
  {
    title: "Request Logger Middleware",
    slug: "request-logger-middleware",
    difficulty: "MEDIUM",
    track: "MIDDLEWARE",
    shortDescription: "Create custom middleware to log HTTP requests",
    description:
      "Build a logging middleware that captures request details including method, URL, timestamp, and response time. Learn about middleware execution order and request/response cycle.",
    instructions: `### Requirements
- Create a custom logging middleware
- Log: method, URL, timestamp, and response time
- Attach logs to \`req.logs\` array for testing
- Apply middleware globally to all routes

### Log Format
Each log entry should contain:
\`\`\`json
{
  "method": "GET",
  "url": "/api/users",
  "timestamp": "2026-01-28T10:30:00.000Z",
  "responseTime": 15
}
\`\`\`

### Routes to Implement
- \`GET /logs\` - Return all captured logs
- \`GET /api/users\` - Sample route (returns \`{ users: [] }\`)
- \`POST /api/users\` - Sample route (returns \`{ created: true }\`)

### Hints
- Use \`Date.now()\` to measure response time
- Attach logs array to \`app.locals.logs\`
- Middleware runs before route handlers`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// TODO: Implement logging middleware and routes

module.exports = app;
`,
    constraints: [
      "No app.listen()",
      "Export Express app",
      "Capture all request details",
      "Calculate response time",
      "Apply middleware before routes",
    ],
    tags: ["middleware", "logging", "performance"],
    testConfig: {
      timeoutMs: 30000,
      memoryMb: 256,
    },
    examples: {
      request: {
        logs: {
          method: "GET",
          url: "http://localhost:3000/logs",
          curl: "curl -X GET http://localhost:3000/logs",
        },
        apiCall: {
          method: "GET",
          url: "http://localhost:3000/api/users",
          curl: "curl -X GET http://localhost:3000/api/users",
        },
      },
      response: {
        logs: {
          status: "HTTP/1.1 200 OK",
          body: [
            {
              method: "GET",
              url: "/api/users",
              timestamp: "2026-01-28T10:30:00.000Z",
              responseTime: 15,
            },
            {
              method: "POST",
              url: "/api/users",
              timestamp: "2026-01-28T10:31:00.000Z",
              responseTime: 23,
            },
          ],
        },
        apiCall: {
          status: "HTTP/1.1 200 OK",
          body: {
            users: [],
          },
        },
      },
    },
    isPublished: true,
    submissionType: "EXPRESS_API",
  },
  {
    title: "In-Memory CRUD API",
    slug: "in-memory-crud-api",
    difficulty: "MEDIUM",
    track: "DATABASE",
    shortDescription: "Build a complete CRUD API with in-memory storage.",
    description:
      "Implement a RESTful API for managing tasks with full CRUD operations using an in-memory array. Learn REST conventions and proper HTTP status codes.",
    instructions: `### Requirements
Implement these endpoints:

1. \`POST /tasks\` - Create a new task
2. \`GET /tasks\` - Get all tasks
3. \`GET /tasks/:id\` - Get a specific task
4. \`PUT /tasks/:id\` - Update a task
5. \`DELETE /tasks/:id\` - Delete a task

### Task Object Structure
\`\`\`json
{
  "id": 1,
  "title": "Learn Express.js",
  "completed": false,
  "createdAt": "2026-01-28T10:30:00.000Z"
}
\`\`\`

### Status Codes
- \`201\` - Created (POST)
- \`200\` - Success (GET, PUT, DELETE)
- \`404\` - Not Found
- \`400\` - Bad Request (missing fields)

### Example: Create Task
\`\`\`bash
POST /tasks
{"title": "Learn Express.js"}
\`\`\`

Response (201):
\`\`\`json
{
  "id": 1,
  "title": "Learn Express.js",
  "completed": false,
  "createdAt": "2026-01-28T10:30:00.000Z"
}
\`\`\``,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// In-memory tasks storage
const tasks = [];

// TODO: Implement CRUD endpoints

module.exports = app;
`,
    constraints: [
      "No app.listen()",
      "Export Express app",
      "Use in-memory array",
      "Proper status codes",
      "Validate required fields",
    ],
    tags: ["crud", "rest-api", "in-memory-db"],
    testConfig: {
      timeoutMs: 30000,
      memoryMb: 256,
    },
    examples: {
      request: {
        create: {
          method: "POST",
          url: "http://localhost:3000/tasks",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            title: "Learn Express.js",
          },
          curl: "curl -X POST http://localhost:3000/tasks \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"title\":\"Learn Express.js\"}'",
        },
        getAll: {
          method: "GET",
          url: "http://localhost:3000/tasks",
          curl: "curl -X GET http://localhost:3000/tasks",
        },
        getOne: {
          method: "GET",
          url: "http://localhost:3000/tasks/1",
          curl: "curl -X GET http://localhost:3000/tasks/1",
        },
        update: {
          method: "PUT",
          url: "http://localhost:3000/tasks/1",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            title: "Learn Express.js Advanced",
            completed: true,
          },
          curl: 'curl -X PUT http://localhost:3000/tasks/1 \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"title":"Learn Express.js Advanced","completed":true}\'',
        },
        delete: {
          method: "DELETE",
          url: "http://localhost:3000/tasks/1",
          curl: "curl -X DELETE http://localhost:3000/tasks/1",
        },
      },
      response: {
        create: {
          status: "HTTP/1.1 201 Created",
          body: {
            id: 1,
            title: "Learn Express.js",
            completed: false,
            createdAt: "2026-01-28T10:30:00.000Z",
          },
        },
        getAll: {
          status: "HTTP/1.1 200 OK",
          body: [
            {
              id: 1,
              title: "Learn Express.js",
              completed: false,
              createdAt: "2026-01-28T10:30:00.000Z",
            },
            {
              id: 2,
              title: "Build an API",
              completed: true,
              createdAt: "2026-01-28T10:31:00.000Z",
            },
          ],
        },
        getOne: {
          status: "HTTP/1.1 200 OK",
          body: {
            id: 1,
            title: "Learn Express.js",
            completed: false,
            createdAt: "2026-01-28T10:30:00.000Z",
          },
        },
        update: {
          status: "HTTP/1.1 200 OK",
          body: {
            id: 1,
            title: "Learn Express.js Advanced",
            completed: true,
            createdAt: "2026-01-28T10:30:00.000Z",
          },
        },
        delete: {
          status: "HTTP/1.1 200 OK",
          body: {
            message: "Task deleted successfully",
          },
        },
        notFound: {
          status: "HTTP/1.1 404 Not Found",
          body: {
            error: "Task not found",
          },
        },
      },
    },
    isPublished: true,
    submissionType: "EXPRESS_API",
  },
];
