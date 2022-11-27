import { join } from "path";

export interface Capabilities {
  createUser: boolean;
  changePassword: boolean;
  validateName: boolean;
  getUser: boolean;
}


// Cannot use import type
// type Capabilities = import("../../../apps/auth/src/routes/capabilities").Capabilities;

/**
 * Get auth capabilities
 * @param authUrl the url for auth service
 * @returns auth capabilities
 */
export async function getCapabilities(authUrl: string): Promise<Capabilities> {
  return await (await fetch(join(authUrl, "/capabilities"))).json() as Capabilities;
}
