import { join } from "path";
import { publicConfig } from "src/utils/config";

export const openDesktop = (node: string, port: number, password: string) => {

  const params = new URLSearchParams({
    path: join(publicConfig.WSPROXY_BASE_PATH, node, String(port)),
    password: password,
    autoconnect: "true",
    reconnect: "true",
    resize: "remote",
  });

  window.open(join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/vnc/vnc.html") + "?" + params.toString(), "_blank");
};

