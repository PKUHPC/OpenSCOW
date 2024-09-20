---
sidebar_position: 3
title: OpenSCOW Hook
---

# OpenSCOW Hook

如果用户配置了OpenSCOW Hook，那么OpenSCOW在发生一些事件时，会通过OpenSCOW Hook调用监听的Hook服务器。您可以通过OpenSCOW Hook监听OpenSCOW中发生的事件，并自己进行一些后续处理。

会调用Hook的事件请参考[`protos/hook/hook.proto`](%REPO_FILE_URL%/protos/hook/hook.proto)文件中`OnEventRequest`消息的`message`属性。

要使用OpenSCOW Hook，您需要：

1. [获取OpenSCOW Protobuf文件](./proto.md)并生成代码
2. 根据`hook`目录下的`proto`文件实现其中定义的gRPC服务
3. 启动您的gRPC服务器
4. 在OpenSCOW中配置OpenSCOW Hook功能

```yaml title="config/common.yaml"
scowHook:
  # 启用OpenSCOW Hook功能，默认为true
  # enabled: true

  # 若您只有一个hook，您可以直接使用url属性，并填入您的Hook的地址
  url: 您的gRPC服务器的地址

  # 若您有多个hook，则可以使用hooks属性，逐个填入您的地址。
  # 若您填写了hooks，则url属性将会被忽略
  hooks:
    - name: hook-name-1 # hook名，可选，若填写了，则在日志中可以看到被调用的hook的名字
      url: hook 1地址 # hook服务器端地址
    - name: hook-name-2
      url: hook 2地址
```

5. 重启OpenSCOW

## OpenSCOW服务连接到Hook服务

请注意，OpenSCOW的服务器是运行在容器中的，通过`localhost`无法访问到运行到OpenSCOW节点上的服务。当设定hook的URL时，请使用服务在您的局域网中的地址。

如果您不确定一个地址是否能从容器中连接，您可以手动在容器中运行`ping`等命令尝试是否能到达您的Hook服务：

```bash
./cli compose exec mis-server sh
ping 您的gRPC服务器的地址
```

## 实际项目示例

- [Go](./examples/go.md#实现并注册scow-hook)

