import { authPlugin } from "src/plugins/auth";
import { errorPlugin } from "src/plugins/error";
import { staticPlugin } from "src/plugins/static";
import { swaggerPlugin } from "src/plugins/swagger";
import { uploadPlugin } from "src/plugins/upload";
import { workerPlugin } from "src/plugins/worker";

export const plugins = [
  authPlugin,
  staticPlugin,
  workerPlugin,
  errorPlugin,
  uploadPlugin,
  swaggerPlugin,
];
