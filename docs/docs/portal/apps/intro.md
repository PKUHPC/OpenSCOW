---
sidebar_position: 1
title: 简介
---

# 交互式应用

借助交互式应用功能，您可以直接在浏览器上使用集群资源在计算节点上启动应用，并通过浏览器使用这些应用。

## 交互式应用的分类

我们将交互式应用分为两类：**服务器类（server）**和**桌面类（vnc）**。

**服务器类(server)**是指通过HTTP和WebSocket协议提供功能的应用，如VSCode, RStudio等；

**桌面类(vnc)**是指运行在桌面上的GUI程序，如Matlab等。系统通过VNC协议远程连接到启动这些应用的计算节点上的X Session中。

系统同时支持这两种应用。您只需要填写对应应用的配置，就可以让用户在浏览器上快速启动并连接到服务器类或者VNC类应用。

![在浏览器上使用服务器类应用VSCode](interactive-apps.png)

## 原理

![交互式应用的原理](../../../diagrams/app.png)

## 配置交互式应用

- [配置服务器类交互式应用](../apps/configure-server-app.md)。
- [配置桌面类交互式应用](../apps/configure-server-app.md)。
