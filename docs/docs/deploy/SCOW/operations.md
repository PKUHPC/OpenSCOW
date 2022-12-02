---
sidebar_position: 8
title: 运维
---

# 运维

本节介绍如何对系统进行的常见运维操作。

## 更新

要更新本系统，如果更新没有引入破坏性升级，那么只需要重新拉取(pull)并重启容器即可。
  - 如果采用的是`docker compose`部署方法，只需要`./compose.sh pull && ./compose.sh up -d`即可

如果更新引入了破坏性的变更，请根据对应的更新说明，修改配置后在进行部署。

## 查看日志

各个组件的日志直接写到`stdout`。

对于使用镜像部署的部分，可以使用常用的docker日志管理命令或者工具管理日志。如果使用的`docker compose`，可以使用`./compose.sh logs -f`后面跟对应服务名称的方式查看服务的日志。

```bash
# 如果docker compose中服务名为auth，使用此命令可以查看auth服务的日志
./compose.sh logs -f auth
```


