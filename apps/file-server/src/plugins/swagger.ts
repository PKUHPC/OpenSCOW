import swagger from "@fastify/swagger";
import fp from "fastify-plugin";
import { TOKEN_COOKIE_HEADER } from "src/config";

export const swaggerPlugin = fp(async (f) => {
  f.register(swagger, {
    openapi: {
      info: {
        title: "SCOW File Server",
        description: "The API for File Server",
        version: "0.1.0",
      },
      components: {
        securitySchemes: {
          cookie: {
            type: "apiKey",
            in: "cookie",
            name: TOKEN_COOKIE_HEADER,
          },
        },
      },
    },
    exposeRoute: false,
  });

});
