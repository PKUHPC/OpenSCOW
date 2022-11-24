import { createGateway, startListening } from "src/proxy";

const server = createGateway();

startListening(server);




