import { createGateway, startListening } from "src/server";

const server = createGateway();

startListening(server);
