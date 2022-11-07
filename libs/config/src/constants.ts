export const CONFIG_BASE_PATH = "/etc/scow";

/** @internal */
export const defaultBasePathConfig = process.env.NODE_ENV === "production" ? CONFIG_BASE_PATH : "config";

