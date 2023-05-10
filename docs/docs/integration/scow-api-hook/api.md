---
sidebar_position: 2
title: SCOW API
---

# SCOW API

SCOW系统总体来说分为前端和后端部分（[架构](../../deploy/architecture/index.md)），SCOW的前端和后端部分使用gRPC进行通信。

要使用SCOW API，您需要

1. [获取SCOW Protobuf文件](./proto.md)并生成相关代码
2. 编写程序，调用gRPC API与SCOW的后端部分组件`mis-server`, `portal-server`交互

## 打开后端服务网络接口

部署好的系统的后端服务容器`mis-server`, `portal-server`位于docker compose创建的网络中，从外界无法直接访问`mis-server`和`portal-server`两个服务。

要想访问这两个服务，您需要通过`install.yaml`将主机上的端口映射到`mis-server`和`portal-server`服务的5000端口中。配置完成后，您可以从部署SCOW的机器上通过定义的IP和端口与对应的服务交互。

```yaml title=install.yaml

portal:
  portMappings:
    # portal-server的5000端口映射到127.0.0.1:7572
    portalServer: "127.0.0.1:7572"
mis:
  portMappings:
    # mis-server的5000端口映射到127.0.0.1:7571
    misServer: "127.0.0.1:7571"
```

## API认证

默认情况下，`mis-server`和`portal-server`的gRPC调用并不认证请求，任何用户都可以直接调用`mis-server`和`portal-server`的API。

在不认证的情况下，如果您在映射端口时直接输入端口号（如`7571`不是`127.0.0.1:7571`），由于在同一个集群中各个节点的网络是互通的，则在同一个集群中的其他作业可能可以直接访问SCOW的gRPC后端，进而直接操作SCOW系统的数据，造成安全隐患。所以我们建议：

- 不将SCOW服务节点用作集群的登录节点或者计算节点
- 在映射端口时输入`127.0.0.1:7571`，使映射出的端口只能在SCOW服务节点上使用
- 给SCOW服务节点设置好防火墙，防止集群内部的服务访问到SCOW服务

您也可以配置服务器端认证。当打开了认证后，任何没有通过认证的请求将会收到`UNAUTHENTICATED`响应。

### 静态Token认证

您也可以配置服务器使用静态Token认证。

在`config/common.yaml`中增加以下配置：

```yaml title="config/common.yaml"
scowApi:
  auth:
    token: <秘密字符串，越长越好>
```

当配置好后，任何到服务器的请求都必须带有`authorization` header，其内容为`Bearer <秘密字符串>`。

门户系统和管理系统前端发送到服务器的请求将会自动带有这个header，无需单独配置。

## 实际项目示例

- [Go](./examples/go.md#使用scow-api)
