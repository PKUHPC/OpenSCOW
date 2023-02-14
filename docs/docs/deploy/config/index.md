---
sidebar_position: 1
title: 配置简介
---

# 配置简介

SCOW使用配置文件进行系统的配置。

SCOW的配置文件均使用`yaml`或者`JSON`格式，如果使用`scow-deployment`部署，则配置文件存放于目录的`config`目录下。

项目在启动时将会检查配置文件是否符合格式，如果配置文件有错，则系统会直接报错。