import { join } from "node:path";

const APP_BASE_PATH = "apps";

const app = process.argv0;

const basePath = join(APP_BASE_PATH, app);
