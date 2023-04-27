---
sidebar_position: 3
title: SCOW Hook
---

# SCOW Hook

如果用户配置了SCOW Hook，那么SCOW在发生一些事件时，会通过SCOW Hook调用监听的Hook服务器。您可以通过SCOW Hook监听SCOW中发生的事件，并自己进行一些后续处理。

会调用Hook的事件请参考[`protos/hook/hook.proto`](%REPO_FILE_URL%/protos/hook/hook.proto)文件中`OnEventRequest`消息的`message`属性。

要使用SCOW Hook，您需要：

1. [获取SCOW Protobuf文件](./proto.md)并生成代码
2. 根据`hook`目录下的`proto`文件实现其中定义的gRPC服务
3. 启动您的gRPC服务器
4. 在SCOW中配置SCOW Hook功能

```yaml title="config/common.yaml"
scowHook:
  url: 您的gRPC服务器的地址
```

5. 重启SCOW

## 实际项目示例

- [Go](./examples/go.md#实现并注册scow-hook)

