---
sidebar_position: 8
title: 配置
---

# 网关配置


## extra

您可以在cli同级的`install.yml`文件中增加对scow自带网关的配置，可接受的格式为nginx的server可接受的属性配置。

例如，增加在当前系统nginx默认端口的http服务`http://extra-web:3000`，则编写

```yaml title="install.yml"
# 网关配置
gateway:
   # 更多nginx配置
    extra: >
        location /extra {
            proxy_pass http://extra-web:3000;
            include includes/headers;
            include includes/websocket;
         }
```

您增加`extra`配置后，可以在使用`./cli compose up -d`启动scow后，使用 ` docker exec -it scow-deployment-gateway-1 /bin/sh` 进入gateway服务，在 `/etc/nginx/http.d` 目录下的 `default.conf` 文件最下方查看到您添加的配置。
如果gateway服务启动失败，说明您的配置不符合规范，请保证其正确性。

