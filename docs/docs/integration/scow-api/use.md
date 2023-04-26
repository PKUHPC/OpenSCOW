---
sidebar_position: 1
title: SCOW API
---

# SCOW API

SCOW系统总体来说分为前端和后端部分（[架构](./deploy/../../deploy/architecture/index.md)），SCOW的前端和后端部分使用gRPC进行通信。

若您有需求，您可以编写程序直接通过gRPC与SCOW的后端部分组件`mis-server`, `portal-server`交互。

## API版本控制

我们通过npm对API版本进行控制。当前的版本为：![npm](https://img.shields.io/npm/v/@scow/grpc-api?label=%40scow%2Fgrpc-api)

API的版本通过`@scow/grpc-api`包的版本进行定义。SCOW gRPC API版本控制原则：

- 不影响API的修改，例如lint文件：提高PATCH号
- 修改了API，但是兼容当前的API：提高MINOR号
- 不兼容已有的配置文件，提高MAJOR版本

当前，我们并不保证新版本SCOW对老版本API的兼容性。

## 使用SCOW API

要与SCOW系统交互，您首先需要获取API的Protocol Buffer (proto)文件，并通过这些proto文件生成您所需要的语言的模板代码，然后根据这些模板代码进行开发。

我们将SCOW API的proto文件放到了代码仓库中，您可以直接从代码仓库中获取。代码仓库中`protos`目录下则为proto文件：[master分支protos目录链接](%REPO_FILE_URL%/protos)

proto文件分为`common`, `portal`和`server`。其中，`common`和`portal`里的用于和`portal-server`门户后端交互，`common`和`server`用于和`mis-server`管理系统后端交互。

要获取SCOW API所需要的文件并进行代码生成，您有以下几个方案：

### 1. 使用Buf获取和生成代码（推荐）

[Buf](https://buf.build/docs/tutorials/getting-started-with-buf-cli/)是一个管理gRPC API和proto文件的一站式工具，可完成获取文件、生成代码等常见功能。我们推荐通过使用Buf直接从GitHub上获取代码并生成您的语言的模板的代码的工作。

```bash
# 使用本地buf.gen.yaml生成模板，使用SCOW仓库的master分支的SCOW API
buf generate --template buf.gen.yaml https://github.com/PKUHPC/SCOW.git#branch=master
```

不同语言示例：

- [Go](./go.md)

### 2. 通过npm获取proto文件

您可以通过npm从`npmjs.org`上获取任意版本的proto文件

```bash
# 最新版本的API文件
npm install -g @scow/grpc-api

# 特定版本(0.1.2)的API
npm install -g @scow/grpc-api@0.1.2

# 安装好后，可以去npm的全局模块的目录中查找到这个包，并获取内部的文件
cd $(npm root -g)/@scow/grpc-api

# 如果您使用npm对您的项目进行依赖管理，则可以在您的项目中安装此包，并直接在此包的node_modules中获取到proto文件
npm install --save @scow/grpc-api
cd node_modules/@scow/grpc-api
```

## 打开后端服务网络接口

部署好的系统的后端服务容器`mis-server`, `portal-server`位于docker compose创建的网络中，从外界无法直接访问`mis-server`和`portal-server`两个服务。

要想访问这两个服务，您需要通过`config.py`将主机上的端口映射到`mis-server`和`portal-server`服务的5000端口中。

```python title=config.py
DEBUG = {
  "OPEN_PORTS": {
    # mis-server的5000端口映射到127.0.0.1:7571
    "MIS_SERVER": "127.0.0.1:7571",

    # portal-server的5000端口映射到127.0.0.1:7572
    "PORTAL_SERVER": "127.0.0.1:7572",
  }
}
```

:::caution

SCOW的gRPC后端并不包含任何鉴权和认证过程。如果您在映射端口时直接输入端口号（如`7571`不是`127.0.0.1:7571`），由于在同一个集群中各个节点的网络是互通的，则在同一个集群中的其他作业可能可以直接访问SCOW的gRPC后端，进而直接操作SCOW系统的数据，造成安全隐患。所以我们建议：

- 不将SCOW服务节点用作集群的登录节点或者计算节点
- 在映射端口时输入`127.0.0.1:7571`，使映射出的端口只能在SCOW服务节点上使用
- 给SCOW服务节点设置好防火墙，防止集群内部的服务访问到SCOW服务

:::

