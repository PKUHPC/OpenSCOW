---
sidebar_position: 3
title: 公共文件
---

# 公共文件

您存放在和`install.yml`同级的`public`目录下下的文件将可以在portal-web和mis-web的部署路径的`/api/public` URL下访问。

例如`public/test.png`，portal-web部署在`/`下可从`/api/public/test.png`访问这个文件，mis-web部署在`/mis`下可从`/mis/api/public/test.png`访问到这个文件。

更新`public`目录下的文件无需重启服务器。
