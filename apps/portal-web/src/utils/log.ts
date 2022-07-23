import pino, { Bindings, Logger } from "pino";

const logger = pino();

export type { Logger };

export const createLogger = (bindings: Bindings = {}) => logger.child(bindings);