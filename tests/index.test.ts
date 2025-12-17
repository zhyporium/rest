import { expect, test, describe } from "vitest";
import { REST } from "../src";

// Define types for Poke API routes
interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: {
    type: {
      name: string;
      url: string;
    };
  }[];
}

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

interface PokemonType {
  id: number;
  name: string;
  pokemon: {
    pokemon: {
      name: string;
      url: string;
    };
  }[];
}

type PokeAPIRoutes = {
  GET: {
    "/pokemon/:name": {
      params: {
        name: string;
      };
      headers?: Record<string, string>;
      response: Pokemon;
    };
    "/pokemon": {
      query?: {
        limit?: string;
        offset?: string;
      };
      headers?: Record<string, string>;
      response: PokemonListResponse;
    };
    "/type/:name": {
      params: {
        name: string;
      };
      headers?: Record<string, string>;
      response: PokemonType;
    };
    "/pokemon/[name]": {
      params: {
        name: string;
      };
      headers?: Record<string, string>;
      response: Pokemon;
    };
  };
  POST: {};
  PATCH: {};
  PUT: {};
  DELETE: {};
};

describe("REST Client with Poke API", () => {
  const baseUrl = "https://pokeapi.co/api/v2";
  const client = new REST<PokeAPIRoutes>(baseUrl, {
    "Content-Type": "application/json",
  });

  describe("GET requests", () => {
    test("should fetch a pokemon by name", async () => {
      const result = await client.get("/pokemon/:name", {
        params: {
          name: "pikachu",
        },
      });

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.response).toBeDefined();
        expect(result.response.ok).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.name).toBe("pikachu");
        expect(result.data.id).toBe(25);
        expect(result.data.height).toBeGreaterThan(0);
        expect(result.data.weight).toBeGreaterThan(0);
        expect(Array.isArray(result.data.types)).toBe(true);
      }
    });

    test("should fetch a pokemon by ID using path params", async () => {
      const result = await client.get("/pokemon/:name", {
        params: {
          name: "1",
        },
      });

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.data).toBeDefined();
        expect(result.data.name).toBe("bulbasaur");
        expect(result.data.id).toBe(1);
      }
    });

    test("should fetch pokemon list with query parameters", async () => {
      const result = await client.get("/pokemon", {
        query: {
          limit: "5",
          offset: "0",
        },
      });

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.response).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.data.count).toBeGreaterThan(0);
        expect(Array.isArray(result.data.results)).toBe(true);
        expect(result.data.results.length).toBe(5);
        expect(result.data.results[0]).toHaveProperty("name");
        expect(result.data.results[0]).toHaveProperty("url");
      }
    });

    test("should fetch pokemon list without query parameters", async () => {
      const result = await client.get("/pokemon", {});

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.data).toBeDefined();
        expect(result.data.count).toBeGreaterThan(0);
        expect(Array.isArray(result.data.results)).toBe(true);
      }
    });

    test("should fetch pokemon type information", async () => {
      const result = await client.get("/type/:name", {
        params: {
          name: "electric",
        },
      });

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.data).toBeDefined();
        expect(result.data.name).toBe("electric");
        expect(result.data.id).toBeGreaterThan(0);
        expect(Array.isArray(result.data.pokemon)).toBe(true);
      }
    });

    test("should handle invalid pokemon name and return error", async () => {
      const result = await client.get("/pokemon/:name", {
        params: {
          name: "invalid-pokemon-name-12345",
        },
      });

      expect(result.status).toBe("error");

      if (result.status === "error") {
        expect(result.error).toBeDefined();
        expect(result.error).toBeInstanceOf(Error);
        expect(result.response).toBeDefined();
        expect(result.response?.ok).toBe(false);
        expect(result.response?.status).toBe(404);
      }
    });

    test("should handle path parameters with brackets syntax", async () => {
      const result = await client.get("/pokemon/[name]", {
        params: {
          name: "charizard",
        },
      });

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.data).toBeDefined();
        expect(result.data.name).toBe("charizard");
      }
    });
  });

  describe("Headers", () => {
    test("should include base headers in requests", async () => {
      const customClient = new REST<PokeAPIRoutes>(baseUrl, {
        "User-Agent": "Test-Agent",
        "X-Custom-Header": "custom-value",
      });

      const result = await customClient.get("/pokemon/:name", {
        params: {
          name: "ditto",
        },
        headers: {
          "X-Additional-Header": "additional-value",
        },
      });

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.data).toBeDefined();
        expect(result.data.name).toBe("ditto");
      }
    });

    test("should merge request headers with base headers", async () => {
      const customClient = new REST<PokeAPIRoutes>(baseUrl, {
        "X-Base-Header": "base-value",
      });

      const result = await customClient.get("/pokemon/:name", {
        params: {
          name: "eevee",
        },
        headers: {
          "X-Request-Header": "request-value",
        },
      });

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.response).toBeDefined();
      }
    });
  });

  describe("URL construction", () => {
    test("should correctly construct URLs with path and query parameters", async () => {
      const result = await client.get("/pokemon", {
        query: {
          limit: "10",
          offset: "20",
        },
      });

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.data).toBeDefined();
        // Verify that offset is working (should return different results)
        expect(result.data.results.length).toBe(10);
      }
    });

    test("should handle empty query parameters", async () => {
      const result = await client.get("/pokemon", {
        query: {},
      });

      expect(result.status).toBe("success");
      if (result.status === "success") {
        expect(result.data).toBeDefined();
      }
    });
  });

  describe("Response handling", () => {
    test("should parse JSON responses correctly", async () => {
      const result = await client.get("/pokemon/:name", {
        params: {
          name: "mewtwo",
        },
      });

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.data).toBeDefined();
        expect(typeof result.data.id).toBe("number");
        expect(typeof result.data.name).toBe("string");
        expect(typeof result.data.height).toBe("number");
      }
    });

    test("should return response object along with data", async () => {
      const result = await client.get("/pokemon/:name", {
        params: {
          name: "snorlax",
        },
      });

      expect(result.status).toBe("success");

      if (result.status === "success") {
        expect(result.data).toBeDefined();
        expect(result.response).toBeDefined();
        expect(result.response.status).toBe(200);
        expect(result.response.headers).toBeDefined();
      }
    });
  });

  describe("Error handling", () => {
    test("should handle network errors gracefully", async () => {
      const invalidClient = new REST<PokeAPIRoutes>(
        "https://invalid-url-that-does-not-exist-12345.com",
        {}
      );

      const result = await invalidClient.get("/pokemon/:name", {
        params: {
          name: "pikachu",
        },
      });

      expect(result.status).toBe("error");

      if (result.status === "error") {
        expect(result.error).toBeDefined();
        expect(result.error).toBeInstanceOf(Error);
        expect(result.response).toBeNull();
      }
    });

    test("should handle 404 errors correctly", async () => {
      const result = await client.get("/pokemon/:name", {
        params: {
          name: "nonexistent-pokemon-99999",
        },
      });

      expect(result.status).toBe("error");

      if (result.status === "error") {
        expect(result.error).toBeDefined();
        expect(result.error).toBeInstanceOf(Error);
        expect(result.response).toBeDefined();
        expect(result.response?.status).toBe(404);
      }
    });
  });
});
