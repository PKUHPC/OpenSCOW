import http from "http";
import { Logger } from "pino";

export function setupGracefulShutdown(server: http.Server, logger: Logger) {

  // graceful shutdown
  const signals = {
    "SIGHUP": 1,
    "SIGINT": 2,
    "SIGTERM": 15,
  };

  Object.entries(signals).forEach(([signal, value]) => {
    process.on(signal, () => {
      server.close(() => {
        logger.info(`Server stopped by ${signal} with value ${value}`);
        process.exit(128 + value);
      });
    });
  });
}
