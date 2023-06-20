---
sidebar_position: 8
title: 配置
---

# 网关配置


## extra

您可以在cli同级的`install.yml`文件中增加对scow自带网关的配置。

例如，增加在当前系统nginx默认端口的http服务`http://extra-web:3000`，则编写

```yaml title="install.yml"
gateway: 
    extra: >
        location /extra {
            proxy_pass http://extra-web:3000;
            include includes/headers;
            include includes/websocket;
         }
```

