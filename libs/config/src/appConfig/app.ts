import { Static, Type } from "@sinclair/typebox";

export const AppConnectPropsSchema = Type.Object({
  method: Type.Enum({ GET: "GET", POST: "POST" }, { description: "连接所使用的HTTP方法" }),
  path: Type.String({ description: "启动的相对路径" }),
  query: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "query参数" })),
  formData: Type.Optional(
    Type.Record(Type.String(), Type.String(), { description: "设置为POST时，需要以form data形式提交的数据" })),
}, { description: "如何连接应用" });


export const AppConfigSchema = Type.Intersect([
  Type.Object({
    id: Type.String({ description: "App ID" }),
    name: Type.String({ description: "App名" }),
    nodes: Type.Optional(
      Type.Array(
        Type.String({ description: "节点地址" }),
        { description: "支持启动这个App的节点名。如果不设置，则所有节点都可以运行" },
      )),
  }),
  Type.Union([
    Type.Object({
      type: Type.Literal("web", { description: "表示为一个Web类应用" }),
      beforeScript: Type.String({ description: "启动应用之前的准备命令。具体参考文档" }),
      script: Type.String({ description: "启动应用的命令。可以使用beforeScript中定义的变量" }),
      connect: AppConnectPropsSchema,
    }),
    Type.Object({
      type: Type.Literal("vnc", { description: "表示为一个VNC类应用" }),
      xstartup: Type.String({ description: "启动此app的xstartup脚本" }),
    }),
  ]),
]);

export type App = Static<typeof AppConfigSchema>;

export const APP_CONFIG_BASE_PATH = "apps";

