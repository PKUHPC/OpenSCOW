import { getCapabilitiesRoute } from "src/routes/capabilities";
import { changePasswordRoute } from "src/routes/changePassword";
import { createUserRoute } from "src/routes/createUser";
import { logoutRoute } from "src/routes/logout";
import { validateNameRoute } from "src/routes/validateName";

import { authRoute } from "./auth";
import { authCallbackRoute } from "./callback";
import { validateTokenRoute } from "./validateToken";

export const routes = [
  authRoute,
  authCallbackRoute,
  validateTokenRoute,
  validateNameRoute,
  createUserRoute,
  changePasswordRoute,
  logoutRoute,
  getCapabilitiesRoute,
];
