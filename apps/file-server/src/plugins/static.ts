import fastifyStatic from "@fastify/static";
import fp from "fastify-plugin";

export const staticPlugin = fp(async (fp) => {
  fp.register(fastifyStatic, {
    root: "/",
    serve: false,
    dotfiles: "allow",
  });
});
