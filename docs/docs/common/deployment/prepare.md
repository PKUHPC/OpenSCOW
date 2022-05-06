---
sidebar_position: 2
title: 准备环境
---

# 准备环境

我们推荐将系统主要部署在一个**单独**的节点上。下文称部署这些组件的节点为**服务节点**。

服务节点应该安装好`docker`（[安装docker的官方文档](https://docs.docker.com/engine/install/)）以及`docker compose`（[安装docker compose的官方文档](https://docs.docker.com/compose/install/)）。


在部署的过程中，可能有的组件需要其他配置，请参考对应的文档。

## 准备相关文件结构

我们推荐将`docker-compose.yml`文件以及所有配置文件存放到一个目录中，并将存放配置文件的目录映射到容器的`/etc/scow`目录中。

```bash title=示例文件结构
$ tree .
.
├── config # 将配置文件放在专门的目录中
│   ├── clusters.json
│   ├── clusterTexts.yml
│   ├── priceItems.json
│   └── users.json
├── docker-compose.yml
```

```yaml title=示例docker-compose服务定义
mis-web:
  image: %CR_URL%/mis-web
  restart: unless-stopped
  environment:
    # 在这里设置环境变量
    CLUSTER_NAMES: "hpc01=hpc01"
  volumes:
    # 将配置文件映射进容器
    - "./config:/etc/scow"
```

## 创建基础文件结构

```bash
# 创建并进入目录
$ mkdir scow && cd scow

# 创建docker-compose.yml文件
$ tee -a docker-compose.yml << END
version: "3"

services:
END

# 创建存放配置文件的目录
$ mkdir config

# 查看目录结构
$ tree .
.
├── config
└── docker-compose.yml
```