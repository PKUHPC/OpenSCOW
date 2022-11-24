import { createProxyServer, startListening } from "src/proxy";

const server = createProxyServer();

startListening(server);




