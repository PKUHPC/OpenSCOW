---
sidebar_position: 4
title: 前端
---

# 部署运营系统前端

门户前端为用户提供运营系统的web内容。

## 安装和配置运营系统前端项目

在`docker-compose.yml`文件的`services`部分增加以下内容。

- 如果本项目将会部署在域名的根目录下，则请使用`mis-web-root`镜像；
- 如果将会部署在`/mis`路径下，请使用`mis-web-mis`镜像。
- 若都不是，请参考[自定义前端相对路径](../../common/customization/customize-basepath.md)。

```yaml title=docker-compose.yml
  mis-web:
    # 根据上面选择镜像
    image: %CR_URL%/mis-web-root
    restart: unless-stopped
    environment:
      # 如果您同时部署了门户前端项目，请配置下值为门户前端项目的路径
      PORTAL_PATH: /portal

    volumes:
      - "./config:/etc/scow"
```

运行`docker compose up -d`启动前端项目。
