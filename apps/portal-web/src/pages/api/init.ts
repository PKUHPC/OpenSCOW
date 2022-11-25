import { NextApiRequest } from "next";
import { registerWebSocketProxyServer } from "src/pages/api/proxy/[type]/[node]/[port]/[[...path]]";
import { registerShellServer } from "src/pages/api/shell/socketio";
import { AugmentedNextApiResponse } from "src/types/next";

// Next.js服务器启动之后需要访问一次这个API Routes，以便初始化shell服务器和websocket代理服务器
export default function(_req: NextApiRequest, res: AugmentedNextApiResponse) {
  if (registerShellServer(res) && registerWebSocketProxyServer(res)) {
    res.send("ok");
  } else {
    res.send("already initialized");
  }
}
