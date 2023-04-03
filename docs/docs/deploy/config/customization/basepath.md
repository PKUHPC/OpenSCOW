---
sidebar_position: 1
title: 相对路径
---

# 自定义相对路径

## 什么是相对路径（base path）

假设我们的系统部署在`https://scowtest.com`下，那么在浏览器中输入此URL，即可访问系统。在这种部署条件下，我们说，系统部署在`scowtest.com`域名下，其相对于域名的路径（相对路径）为根路径，即`/`。

在一些特殊条件下，我们想使用同一个域名部署多个系统，每个系统部署在一个域名的某个**相对路径(base path)**下，例如，我们可能想通过`https://scowtest.com/scow`访问系统。在这种条件下，系统仍然部署在`scowtest.com`域名下，但是其**相对路径**为`/scow`。

## 配置

SCOW支持将系统的门户和管理系统部署在不同的相对路径下，仅需通过修改`install.yaml`中的`basePath`, `portal.basePath`和`mis.basePath`配置即可。

`install.yaml`中，`basePath`、`portal.basePath`和`mis.basePath`均不以`/`结尾。`basePath`填写整个系统的根路径，`portal.basePath`和`mis.basePath`分别表示门户系统和管理系统相对于系统的相对路径，遵循以下的编写原则：

| 整个系统的访问路径 | 门户系统的访问路径 | 管理系统的访问路径 | `basePath` | `portal.basePath` | `mis.basePath` |
| ------------------ | ------------------ | ------------------ | ---------- | ----------------- | -------------- |
| /                  | /                  | /mis               | /          | /                 | /mis           |
| /                  | /portal            | /                  | /          | /portal           | /              |
| /scow              | /scow              | /scow/mis          | /scow      | /                 | /mis           |
| /scow              | /scow/portal       | /scow              | /scow      | /portal           | /              |
