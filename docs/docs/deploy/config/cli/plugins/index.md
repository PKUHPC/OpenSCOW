---
sidebar_position: 8
title: 插件
---

# scow-cli插件

## 编写和配置

您可以通过和cli同级的`plugins`目录编写CLI插件。

每个插件占据一个目录，目录名为插件的ID。例如`plugins/plugin1`，则此插件id为`plugin1`。

当您编写好插件后，您可以通过`install.yml`的`plugins.enabledPlugins`选项，指定启用的插件。

例如，如果要使用`plugin1`插件，则编写

```yaml title="install.yml"
plugins: 
  enabledPlugins: ["plugin1"]
```
## 插件功能

### 覆盖`docker-compose.yml` 

您可以通过此功能更改部署的Docker Compose配置，例如在SCOW网络中部署其他的容器，或者给已有的服务增加新的环境变量、端口等。

在插件目录下，您可以编写`docker-compose.yml`文件，此文件将会与CLI生成的Docker Compose配置文件合并。CLI在调用docker compose时，使用`docker compose -f {scow-cli生成的compose文件} ...-f {所有插件的compose文件}`的方法执行。

```yaml title="plugins/plugin1/docker-compose.yml"
version: "3"

services: 
  extraService:
    image: <您的容器镜像>
    # ...
```

