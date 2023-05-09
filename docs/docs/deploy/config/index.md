---
sidebar_position: 1
title: 配置简介
---

# 配置简介

SCOW使用配置文件进行系统的配置。

SCOW的配置文件均使用`yaml`或者`JSON`格式，存放于`config`目录下。

项目在启动时将会检查配置文件是否符合格式，如果配置文件有错，则系统会直接报错。

您也可以使用[scow-cli](../install/scow-cli.md)的`check-config`子命令，在不运行系统的情况下检查配置文件格式。

```
> ./cli check-config 

ERROR: Error reading config file config/clusters/hpc01.yaml: data/slurm/loginNodes/0 must be string
WARN: mis.yaml userIdPattern is deprecated and will be removed in a future version. Use createUser.userIdPattern instead
```