import { Static, Type } from "@sinclair/typebox";

export const AppServerConfigSchema = Type.Object({
  id: Type.String({ description: "App ID" }),
  name: Type.String({ description: "App名" }),
  nodes: Type.Optional(
    Type.Array(
      Type.String({ description: "节点地址" }),
      { description: "支持启动这个App的节点名。如果不设置，则所有节点都可以运行" },
    )),
  beforeScript: Type.String({ description: "启动应用之前的准备命令。具体参考文档" }),
  script: Type.String({ description: "启动应用的命令。可以使用beforeScript中定义的变量" }),
  connect: Type.Object({
    method: Type.Enum({ GET: "GET", POST: "POST" }, { description: "连接所使用的HTTP方法", default: "GET" }),
    path: Type.String({ description: "启动的相对路径", default: "/" }),
    query: Type.Record(Type.String(), Type.String(), { description: "query参数", default: {} }),
    formData: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "设置为POST时，需要以form data形式提交的数据" })),
  }, { description: "如何连接应用" }),
});

export type AppServer = Static<typeof AppServerConfigSchema>;

export const APP_SERVER_CONFIG_BASE_PATH = "apps";

