---
sidebar_position: 1
title: 运维
---

# 运维

本节介绍如何对系统进行的常见运维操作。

## 更新

SCOW通过容器镜像分发，版本号即SCOW镜像的tag名。

要更新SCOW，请修改`install.yaml`中的`imageTag`为您想更新到的版本（tag名），例如：

```yaml title="install.yaml"
# 使用v0.4.0版本
imageTag: v0.4.0
```

修改完成后，运行以下命令更新容器镜像并重新系统。

```bash
./cli compose pull
./cli compose up -d
```

如果更新引入了破坏性的变更，请根据对应的更新说明，修改配置后在进行部署。

## 日志

### 查看日志

各个组件的日志直接写到`stdout`。可以使用常用的docker日志管理命令或者工具管理日志。如果使用的`docker compose`，可以使用`./cli compose logs -f`后面跟对应服务名称的方式查看服务的日志。

```bash
# 查看认证系统的日志
./cli compose logs -f auth

# 查看门户系统服务器端的日志
./cli compose logs -f portal-server

# 查看管理系统服务器端的日志
./cli compose logs -f mis-server
```

### 配置日志输出

您可以通过安装配置文件配置门户系统后端（`portal-server`）、管理系统后端（`mis-server`）和内置认证系统（`auth`）的日志输出选项。

```yaml title="install.yaml"
log:
  # LOG.LEVEL: 日志等级，可选trace, debug, info, warn, error。默认info
  level: "info"

  # LOG.PRETTY: 是否输出更适合直接读的log。如果为false，则输出json格式的日志。默认false
  pretty: false
```

当`log.pretty`为`true`时，输出日志格式如下：

```
[02:27:00.372] INFO (18): request completed
    reqId: "req-3"
    res: {
      "statusCode": 200
    }
    responseTime: 0.3789879999967525
```

当`log.pretty`为`false`时，输出日志格式如下：

```json
{"level":30,"time":1676429663943,"pid":18,"hostname":"d3fc2f53e863","reqId":"req-1","res":{"statusCode":200},"responseTime":4.37828900013119,"msg":"request completed"}
```

当您需要使用日志收集工具时，建议您使用JSON格式输出日志，然后使用日志分析工具来查看和分析收集到的日志。