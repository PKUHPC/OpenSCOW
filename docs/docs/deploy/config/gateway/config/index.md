---
sidebar_position: 8
title: 配置
---

# 网关配置


## extra

您可以在cli同级的`install.yml`文件中增加对OpenSCOW自带网关的配置，可接受的格式为nginx的server可接受的属性配置。

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

您增加`extra`配置后，可以在使用`./cli compose up -d`启动OpenSCOW后，使用 ` ./cli compose exec gateway sh` 进入gateway服务，在 `/etc/nginx/http.d` 目录下的 `default.conf` 文件最下方查看到您添加的配置。
如果gateway服务启动失败，说明您的配置不符合规范，请保证其正确性。

## 域名白名单配置

OpenSCOW 网关默认不限制 HTTP Host 头

为了防止 host 头攻击的发生，可以通过设置域名白名单来限制 Host 的域名或 IP

```
gateway:
  # 同 nginx server_name 配置
  allowedServerName: example.com www.example.com
```

多个域名或 IP 间用空格间隔即可。

## OpenSCOW 访问协议

设置 OpenSCOW 访问协议`http | https`，将修改认证系统中 callbackUrl 的协议。
默认情况下 callbackUrl 的 protocol 为 http，

如果配置 https 代理，则建议设置该项确保用户体验的一致性。

```
gateway:
  # OpenSCOW 访问协议，将影响 callbackUrl 的 protocol
  # callbackUrl 默认的 protocol 为 http
  protocol: "http"
```