---
sidebar_position: 4
title: 登录节点桌面
---

# 部署登录节点桌面功能

登录节点桌面功能能够让用户在浏览器上就能访问登录节点的桌面，并进行GUI操作。

## 前提条件

目前，桌面功能仅支持登录到单个**登录节点**。在计算节点上启动桌面可借助[交互式任务](./apps.md)实现。

下文中将启动桌面的节点称为**桌面节点**。

请确认集群配置满足以下条件：

- [集群配置文件](../../common/deployment/clusters.mdx)中需要使用此功能的集群已指定至少一个登录节点
- **服务节点**可以免密以任何用户SSH登录到各个**桌面节点**，并且**服务节点**的`/root/.ssh`目录下有登录所需要的`id_rsa.pub`和`id_rsa`文件
- **服务节点**以及**门户前端**容器可以使用集群配置文件中的地址访问到会启动应用的任何一个桌面节点的任何端口
- **桌面节点**已安装TurboVNC 3.0版本或者以上（[官方安装教程](https://turbovnc.org/Downloads/YUM)）

## 部署作业管理服务器

请参考[作业功能部署文档](./jobs.md#部署job-server-slurm)部署作业管理服务器。

## 配置门户前端

在`docker-compose.yml`的`services`部分，给门户前端服务增加配置：

```yml title=docker-compose.yml
  portal-web:
    # ...
    environment:
      ENABLE_LOGIN_DESKTOP: 1
      # 支持的桌面：格式：桌面名=wm值,桌面名=wm值。wm值可为空
      # wm值的含义见下部分
      LOGIN_DESKTOP_WMS: Xfce=xfce,MATE=mate
```

运行`docker compose up -d`更新系统。

## 支持的桌面

我们使用[TurboVNC](https://turbovnc.org)的`-wm`选项指定支持启动的桌面。用户选择的桌面对应的wm值将会被传入TurboVNC的`-wm`参数。

可以查看[TurboVNC 3.0.x Window Manager Compatibility Report](https://turbovnc.org/Documentation/Compatibility30)来确认桌面和操作系统之间的兼容性。

下表为目前已经在CentOS 7上测试的各个桌面与turbovnc的兼容性以及对应的wm值。要想使用对应的桌面，请在对应的桌面节点安装`epel-release`包，再运行安装命令部分的命令安装对应的桌面。

| 桌面     | wm值                    | 安装命令                                   | 兼容性     |
| -------- | ----------------------- | ------------------------------------------ | ---------- |
| KDE      | `1-kde-plasma-standard` | `yum groupinstall "KDE Plasma Workspaces"` | 可用       |
| Xfce     | `xfce`                  | `yum groupinstall "Xfce"`                  | 可用       |
| MATE     | `mate`                  | `yum groupinstall "MATE Desktop"`          | 可用       |
| cinnamon | `cinnamon`              | `yum install cinnamon`                     | 可用       |
| GNOME 2  | `2d`                    | `yum groupinstall "GNOME Desktop"`         | **不可用** |
| GNOME 3  | ` `（空字符串）         | `yum groupinstall "GNOME Desktop"`         | **不可用** |

根据TurboVNC的文档，如果需要启动其他桌面，您可以将wm值设置为任意`/usr/share/xsessions`下的文件名（不包括`.desktop`后缀）来启动对应的桌面。