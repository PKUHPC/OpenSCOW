import net from "net";

export async function getFreePort(): Promise<number> {
  return new Promise((res) => {
    const server = net.createServer((s) => {
      s.end("Hello world\n");
    });
    server.listen(0, () => {
      const port = (server.address() as net.AddressInfo).port;
      res(port);
    }).close();
  });

}

const DISPLAY_ID_PORT_DELTA = 5900;

export function displayIdToPort(displayId: number): number {
  return DISPLAY_ID_PORT_DELTA + displayId;
}

export function portToDisplayId(port: number): number {
  return port - DISPLAY_ID_PORT_DELTA;
}
