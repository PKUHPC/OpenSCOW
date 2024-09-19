---
slug: scow-update-to-v1.0
title: SCOW升级：从v0.4.0(及以上)到v1.0.0
authors: [huangjun]
tags: [scow, scow-deployment, v1.0.0]

---


本文档适用于从v0.4.0(及以上)升级到v1.0.0。

# 1. 升级cli

```bash
# 两种方式升级cli
# 1. 直接下载替换本地cli
wget https://github.com/PKUHPC/OpenSCOW/releases/download/v1.0.0/cli-x64

# 2. 使用命令升级
./cli update --release v1.0.0
```

# 2. 添加审计日志功能

在install.yaml添加如下配置：

```yaml
# 可添加审计日志功能，并配置审计日志数据库密码
audit:
  dbPassword: "must!chang3this"
```

install.yaml配置参考(极简配置)：

```yaml
port: 80
basePath: /
imageTag: v1.0.0
portal:
  portMappings: {}
mis:
  dbPassword: must!chang3this
  portMappings: {}
log:
  fluentd:
    logDir: /var/log/fluentd
auth:
  portMappings: {}
audit:
  dbPassword: "must!chang3this"
gateway:
  proxyReadTimeout: 36000s
```

添加审计日志配置文件，在`./config`目录下添加audit.yaml

```yaml
# 审计系统数据库的信息。可以不修改
db:
  host: audit-db
  port: 3306
  user: root
  dbName: scow_audit
```

# 3. 修改mis.yaml

修改mis.yaml，去掉源作业数据库相关配置，去掉`fetchJobs.db`配置，类似如下：

```yaml
fetchJobs:
  # 源作业信息数据库的数据库信息
  db:
    host: 192.168.188.11
    port: 3306
    user: root
    password: "aUTx373~5pU@!&^6"
    dbName: hpc
    tableName: job_table
    type: mysql
```

mis.yaml配置参考(极简配置)：

```yaml
db:
  host: db
  port: 3306
  user: root
  dbName: scow

fetchJobs:
  periodicFetch:
    enabled: true
    cron: "*/10 * * * *"

predefinedChargingTypes:
  - 测试

accountNamePattern:
  regex: "(a_)[a-z]+$"
```

# 4. 部署适配器

适配器编译部署可参考[文档](https://github.com/PKUHPC/scow-slurm-adapter/blob/master/docs/deploy.md)。

:::tip

由于github代码仓库下载的适配器可执行程序是由github action生成，glibc版本(2.34)较高，若slurm适配器部署节点的glibc版本低于该版本，建议下载源码，自行编译。

:::

# 5. 修改集群配置文件

```yaml
displayName: hpc01

loginNodes:
  - name: hpc01_login01
    address: hpc01_login01

adapterUrl: "192.168.188.102:8999"
```

:::tip

注意将登录节点`loginNodes.address`参数和适配器url`adapterUrl`修改为实际集群的值。详细配置可参考[该文档](https://pkuhpc.github.io/OpenSCOW/docs/deploy/config/cluster-config)。

:::

# 6. 交互式应用增加图标(可选)

支持为交互式应用配置图标：将图标文件上传至`./public/apps/`目录，并在应用配置文件中添加图标的路径。

例如给jupyter添加一个图标(已将`jupyter.png`上传至`./public/apps/`)，在jupyter.yaml中添加如下内容：

```yaml
logoPath: /apps/jupyter.png
```

:::tip

多集群下交互式应用配置可参考[该文档](https://pkuhpc.github.io/OpenSCOW/docs/deploy/config/portal/apps/configure-cluster-apps)。

:::

# 7. 登录页面添加slogan(可选)

支持登录界面自定义slogan内容，修改`./config/auth.yaml`文件，添加如下内容：

```yaml
ui:
  backgroundImagePath: "./assets/background.png"
  backgroundFallbackColor: "#9a0000"
  logoType: "dark"
  slogan: 
    color: "white"
    title: "开源算力中心门户和管理平台"
    texts:
       - "图形化界面，使用方便"
       - "功能丰富，管理简单"
       - "一体化部署，开箱即用"
       - "标准化平台，支持算力融合"
       - "开源中立，独立自主"
```

:::tip

详细配置可参考[该文档](https://pkuhpc.github.io/OpenSCOW/docs/deploy/config/auth/config)。

:::

# 8. 重启服务

```Bash
./cli compose down
./cli compose up -d 
```