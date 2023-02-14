---
sidebar_position: 1
title: 运维
---

# 运维

本节介绍如何对系统进行的常见运维操作。

## 更新

要更新本系统，如果更新没有引入破坏性升级，那么只需要重新拉取(pull)并重启容器即可。

```bash
./compose.sh pull
./compose.sh up -d
```

如果更新引入了破坏性的变更，请根据对应的更新说明，修改配置后在进行部署。

## 日志

### 查看日志

各个组件的日志直接写到`stdout`。可以使用常用的docker日志管理命令或者工具管理日志。如果使用的`docker compose`，可以使用`./compose.sh logs -f`后面跟对应服务名称的方式查看服务的日志。

```bash
# 查看认证系统的日志
./compose.sh logs -f auth

# 查看门户系统服务器端的日志
./compose.sh logs -f portal-server

# 查看管理系统服务器端的日志
./compose.sh logs -f mis-server
```

### 配置日志输出

您可以通过`config.py`配置门户系统后端（`portal-server`）、管理系统后端（`mis-server`）和内置认证系统（`auth`）的日志输出选项。

```python
# ------- 日志配置 -------
#
# LOG.LEVEL: 日志等级，可选trace, debug, info, warn, error。默认info
# LOG.PRETTY: 是否输出更适合直接读的log。如果为False，则输出json格式的日志。默认False
LOG = {
  "LEVEL": "info",
  "PRETTY": True,
}
```


