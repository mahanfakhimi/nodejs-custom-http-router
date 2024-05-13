import http from "node:http";

type RequestHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  }
) => void;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RouteDefinition = { [route: string]: RequestHandler };

type RouteMap = {
  [method in HttpMethod]?: RouteDefinition;
};

class HttpRouter {
  private readonly routes: RouteMap = {};

  constructor() {}

  public createRouter() {
    const addRoute = (
      method: HttpMethod,
      route: string,
      handler: RequestHandler
    ) => {
      if (!this.routes[method]) {
        this.routes[method] = {};
      }

      this.routes[method]![route] = handler;
    };

    return {
      addRoute,
    };
  }

  public startListening(port: number) {
    const server = http.createServer((req, res) => {
      const { method, url } = req;

      const methodRoutes = this.routes[method as HttpMethod];

      if (!methodRoutes) {
        return;
      }

      const handler = methodRoutes[url!] || null;

      if (handler) {
        handler(req, res);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Route Not Found");
      }
    });

    return server.listen({ port });
  }
}

const httpRouter = new HttpRouter();

const router = httpRouter.createRouter();

router.addRoute("GET", "/", (_req, res) => {
  res.writeHead(200);
  res.end("Index");
});

router.addRoute("GET", "/about", (_req, res) => {
  res.writeHead(200);
  res.end("About Us");
});

router.addRoute("GET", "/contact", (_req, res) => {
  res.writeHead(200);
  res.end("Contact Us");
});

router.addRoute("GET", "/products", (_req, res) => {
  res.writeHead(200);
  res.end("Our Products");
});

router.addRoute("POST", "/create-product", (req, res) => {
  let body: Buffer[] = [];

  req
    .on("data", (chunk) => body.push(chunk))
    .on("end", () => {
      const requestBody = Buffer.concat(body).toString();

      res.writeHead(200);

      res.end(
        JSON.stringify({
          body: JSON.parse(requestBody),
          message: "Product Created",
        })
      );
    });
});

httpRouter.startListening(8080).on("listening", () => {
  console.log("Node.js HTTP Server is running at port 8080");
});
