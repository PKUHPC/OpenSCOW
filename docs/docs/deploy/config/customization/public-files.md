---
sidebar_position: 3
title: 公共文件
---

# 公共文件

您存放在和`install.yml`同级的`public`目录下下的文件将可以在SCOW部署路径的`/__public__` 路径下访问。

例如`public/test.png`，SCOW的base path为`/scow`，则可以在`/scow/__public__/test.png`下访问到这个文件。

更新`public`目录下的文件无需重启服务器。
