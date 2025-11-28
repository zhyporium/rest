# @zhyporium/rest

A type-safe REST client for TypeScript that provides full type checking for your API routes and responses.

## Features

- 🔒 **Type-safe**: Full TypeScript support with compile-time type checking
- 🛣️ **Route definitions**: Define your API routes with TypeScript interfaces
- 📦 **Multiple HTTP methods**: Support for GET, POST, PATCH, PUT, and DELETE
- 🔗 **Path parameters**: Support for both `:param` and `[param]` syntax
- 🔍 **Query parameters**: Built-in query string handling
- 📝 **Headers**: Base headers with per-request header overrides
- ✅ **Error handling**: Structured error responses with status checking
- 🎯 **Response types**: Automatic JSON parsing with type safety

## Installation

```bash
npm install @zhyporium/rest
# or
pnpm add @zhyporium/rest
# or
yarn add @zhyporium/rest
```

## Usage

### Basic Example

```typescript
import { REST } from "@zhyporium/rest";

// Define your API routes
type MyAPIRoutes = {
  GET: {
    "/users/:id": {
      params: { id: string };
      headers?: Record<string, string>;
      response: { id: string; name: string; email: string };
    };
    "/users": {
      query?: { limit?: string; offset?: string };
      headers?: Record<string, string>;
      response: { users: Array<{ id: string; name: string }> };
    };
  };
  POST: {
    "/users": {
      body: { name: string; email: string };
      headers?: Record<string, string>;
      response: { id: string; name: string; email: string };
    };
  };
  PATCH: {};
  PUT: {};
  DELETE: {};
};

// Create a REST client instance
const client = new REST<MyAPIRoutes>("https://api.example.com", {
  "Content-Type": "application/json",
  Authorization: "Bearer your-token",
});

// Make type-safe requests
const result = await client.get("/users/:id", {
  params: { id: "123" },
});

if (result.status === "success") {
  console.log(result.response.name); // TypeScript knows this is a string
  console.log(result.fetchResponse); // Access the raw Response object
} else {
  console.error(result.error); // Handle errors
}
```

### Path Parameters

The client supports two path parameter syntaxes:

```typescript
// Express-style with colon
await client.get("/users/:id", { params: { id: "123" } });

// Bracket syntax
await client.get("/users/[id]", { params: { id: "123" } });
```

### Query Parameters

```typescript
const result = await client.get("/users", {
  query: {
    limit: "10",
    offset: "20",
  },
});
```

### POST Requests

```typescript
const result = await client.post("/users", {
  body: {
    name: "John Doe",
    email: "john@example.com",
  },
  headers: {
    "X-Custom-Header": "value",
  },
});
```

### Error Handling

All methods return a discriminated union that you can safely check:

```typescript
const result = await client.get("/users/:id", {
  params: { id: "123" },
});

if (result.status === "success") {
  // TypeScript knows result.response is the response type
  console.log(result.response);
  console.log(result.fetchResponse.status); // Access raw response
} else {
  // TypeScript knows result.error is an Error
  console.error(result.error);
  if (result.fetchResponse) {
    console.error(result.fetchResponse.status); // May be null for network errors
  }
}
```

## API Reference

### `REST<Routes>`

The main REST client class.

#### Constructor

```typescript
new REST<Routes>(baseUrl: string, baseHeaders: Record<string, string>)
```

- `baseUrl`: The base URL for all requests
- `baseHeaders`: Headers to include in all requests

#### Methods

- `get<T>(path: T, request): Promise<RESTResponse<...>>`
- `post<T>(path: T, request): Promise<RESTResponse<...>>`
- `patch<T>(path: T, request): Promise<RESTResponse<...>>`
- `put<T>(path: T, request): Promise<RESTResponse<...>>`
- `delete<T>(path: T, request): Promise<RESTResponse<...>>`

### Response Type

```typescript
type RESTResponse<ResponseType> =
  | {
      status: "success";
      response: ResponseType;
      fetchResponse: Response;
    }
  | {
      status: "error";
      error: Error;
      fetchResponse: Response | null;
    };
```

## Development

### Install dependencies

```bash
pnpm install
```

### Run tests

```bash
pnpm test
```

### Build the library

```bash
pnpm build
```

### Type checking

```bash
pnpm typecheck
```

### Watch mode

```bash
pnpm dev
```

## License

MIT
