import { authPlugin } from "src/plugins/auth";
import { redisPlugin } from "src/plugins/redis";
import { staticPlugin } from "src/plugins/static";

export const plugins = [
  redisPlugin,
  authPlugin,
  staticPlugin,
];
