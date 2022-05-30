
import { Static, Type } from "@sinclair/typebox";

export const AppServerConfigSchema = Type.Object({
  id: Type.String({ description: "App ID" }),
  name: Type.String({ description: "App名" }),
  nodes: Type.Array(Type.String({ description: "节点地址" }), { description: "支持启动这个App的节点名" }),
  script: Type.String({ description: "启动应用的命令。可以使用$PORT表示分配到的端口" }),
});

export type AppServer = Static<typeof AppServerConfigSchema>;

export const APP_SERVER_CONFIG_BASE_PATH = "apps";

