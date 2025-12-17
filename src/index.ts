interface RouteRequest {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
  response: any;
}

interface RoutesLike {
  GET: Record<string, Omit<RouteRequest, "body">>; // Since GET requests don't have a body, we can omit it
  POST: Record<string, RouteRequest>;
  PATCH: Record<string, RouteRequest>;
  PUT: Record<string, RouteRequest>;
  DELETE: Record<string, RouteRequest>;
}

type RESTResponse<ResponseType> =
  | {
      status: "success";
      data: ResponseType;
      response: Response;
    }
  | {
      status: "error";
      error: Error;
      response: Response | null;
    };

export class REST<Routes extends RoutesLike> {
  public constructor(
    private readonly baseUrl: string,
    private readonly baseHeaders: Record<string, string>
  ) {}

  private makeHeaders(
    headers?: Record<string, string>
  ): Record<string, string> {
    return {
      ...this.baseHeaders,
      ...headers,
    };
  }

  private makeUrl(
    path: string,
    params?: Record<string, string>,
    query?: Record<string, string>
  ): string {
    let updatedPath: string = path;

    if (params && Object.keys(params).length) {
      for (const [key, value] of Object.entries(params)) {
        updatedPath = updatedPath
          .replaceAll(`[${key}]`, value?.toString() ?? "")
          .replaceAll(`:${key}`, value?.toString() ?? ""); // Support for express-style routes
      }
    }

    const url = new URL(`${this.baseUrl}${updatedPath}`);

    if (query && Object.keys(query).length) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value?.toString() ?? "");
      }
    }

    return url.toString();
  }

  public async get<T extends keyof Routes["GET"] & string>(
    path: T,
    request: Omit<Routes["GET"][T], "response">
  ): Promise<RESTResponse<Routes["GET"][T]["response"]>> {
    try {
      const response = await fetch(
        this.makeUrl(path, request?.params, request?.query),
        {
          method: "GET",
          headers: this.makeHeaders(request?.headers),
        }
      );

      if (!response.ok) {
        return {
          status: "error",
          error: new Error(response.statusText),
          response,
        };
      }

      if (response.headers.get("Content-Type")?.includes("application/json")) {
        return {
          status: "success",
          data: (await response.json()) as Routes["GET"][T]["response"],
          response,
        };
      }

      return {
        status: "success",
        data: (await response.text()) as Routes["GET"][T]["response"],
        response,
      };
    } catch (error) {
      return {
        status: "error",
        error: error as Error,
        response: null,
      };
    }
  }

  public async post<T extends keyof Routes["POST"] & string>(
    path: T,
    request: Omit<Routes["POST"][T], "response">
  ): Promise<RESTResponse<Routes["POST"][T]["response"]>> {
    try {
      const headers = this.makeHeaders(request?.headers);

      const response = await fetch(
        this.makeUrl(path, request?.params, request?.query),
        {
          method: "POST",
          headers,
          body: headers["Content-Type"]?.includes("application/json")
            ? JSON.stringify(request?.body)
            : request?.body,
        }
      );

      if (!response.ok) {
        return {
          status: "error",
          error: new Error(response.statusText),
          response,
        };
      }

      if (response.headers.get("Content-Type")?.includes("application/json")) {
        return {
          status: "success",
          data: (await response.json()) as Routes["POST"][T]["response"],
          response,
        };
      }

      return {
        status: "success",
        data: (await response.text()) as Routes["POST"][T]["response"],
        response,
      };
    } catch (error) {
      return {
        status: "error",
        error: error as Error,
        response: null,
      };
    }
  }

  public async patch<T extends keyof Routes["PATCH"] & string>(
    path: T,
    request: Omit<Routes["PATCH"][T], "response">
  ): Promise<RESTResponse<Routes["PATCH"][T]["response"]>> {
    try {
      const headers = this.makeHeaders(request?.headers);

      const response = await fetch(
        this.makeUrl(path, request?.params, request?.query),
        {
          method: "PATCH",
          headers,
          body: headers["Content-Type"]?.includes("application/json")
            ? JSON.stringify(request?.body)
            : request?.body,
        }
      );

      if (!response.ok) {
        return {
          status: "error",
          error: new Error(response.statusText),
          response,
        };
      }

      if (response.headers.get("Content-Type")?.includes("application/json")) {
        return {
          status: "success",
          data: (await response.json()) as Routes["PATCH"][T]["response"],
          response,
        };
      }

      return {
        status: "success",
        data: (await response.text()) as Routes["PATCH"][T]["response"],
        response,
      };
    } catch (error) {
      return {
        status: "error",
        error: error as Error,
        response: null,
      };
    }
  }

  public async put<T extends keyof Routes["PUT"] & string>(
    path: T,
    request: Omit<Routes["PUT"][T], "response">
  ): Promise<RESTResponse<Routes["PUT"][T]["response"]>> {
    try {
      const headers = this.makeHeaders(request?.headers);

      const response = await fetch(
        this.makeUrl(path, request?.params, request?.query),
        {
          method: "PUT",
          headers,
          body: headers["Content-Type"]?.includes("application/json")
            ? JSON.stringify(request?.body)
            : request?.body,
        }
      );

      if (!response.ok) {
        return {
          status: "error",
          error: new Error(response.statusText),
          response,
        };
      }

      if (response.headers.get("Content-Type")?.includes("application/json")) {
        return {
          status: "success",
          data: (await response.json()) as Routes["PUT"][T]["response"],
          response,
        };
      }

      return {
        status: "success",
        data: (await response.text()) as Routes["PUT"][T]["response"],
        response,
      };
    } catch (error) {
      return {
        status: "error",
        error: error as Error,
        response: null,
      };
    }
  }

  public async delete<T extends keyof Routes["DELETE"] & string>(
    path: T,
    request: Omit<Routes["DELETE"][T], "response">
  ): Promise<RESTResponse<Routes["DELETE"][T]["response"]>> {
    try {
      const headers = this.makeHeaders(request?.headers);

      const response = await fetch(
        this.makeUrl(path, request?.params, request?.query),
        {
          method: "DELETE",
          headers,
          body: headers["Content-Type"]?.includes("application/json")
            ? JSON.stringify(request?.body)
            : request?.body,
        }
      );

      if (!response.ok) {
        return {
          status: "error",
          error: new Error(response.statusText),
          response,
        };
      }

      if (response.headers.get("Content-Type")?.includes("application/json")) {
        return {
          status: "success",
          data: (await response.json()) as Routes["DELETE"][T]["response"],
          response,
        };
      }

      return {
        status: "success",
        data: (await response.text()) as Routes["DELETE"][T]["response"],
        response,
      };
    } catch (error) {
      return {
        status: "error",
        error: error as Error,
        response: null,
      };
    }
  }
}
