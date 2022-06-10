---
sidebar_position: 1
title: LDAP 
---

# LDAP认证系统

本节介绍采用LDAP进行用户认证的认证系统。如果您的系统采用其他认证方式，您可以参考文档中的其他认证方式，或者查看[自定义认证](./custom.md)文档以自己实现符合自己需求的认证方式。

## LDAP各个操作流程

为了更好的理解并配置LDAP认证系统，本节将介绍各个操作时，LDAP认证系统所进行的操作。下文中，全大写的代码块（如`LDAP_BIND_DN`为可配置的环境变量。请确认您的LDAP配置兼容这里所称的流程。

### 登录

当用户登录时，认证系统获得用户的用户名和密码，进行以下操作：

1. 使用`LDAP_BIND_DN`和`LDAP_BIND_PASSWORD`作为用户名和密码与向LDAP服务器所在的`LDAP_URL`发起bind请求
2. bind成功后，以`LDAP_SEARCH_BASE`为搜索根，以sub模式，以`LDAP_FILTER` 和 (`LDAP_ATTR_UID`等于输入的用户名) 为筛选条件搜索节点
   1. 如果搜索结果为空，则登录失败
   2. 如果搜索节点有多个，取第一个结果
3. 以**上一个结果的DN**以及**输入的密码**作为用户名和密码，与LDAP服务器发起bind请求
   1. 如果bind失败，则登录失败
4. 登录成功。生成一个UUID作为token，将token与**输入的用户名**存入redis
5. 重定向到用户在登录时，通过querystring指定的callback URL，并传入`token={token}`作为querystring参数

### 创建用户

当用户在运营系统中创建后，认证系统获得新用户的用户名、用户姓名、密码和邮箱，进行以下操作

1. 使用`LDAP_BIND_DN`和`LDAP_BIND_PASSWORD`作为用户名和密码与向LDAP服务器所在的`LDAP_URL`发起bind请求
2. 创建一个新的entry作为用户，其DN以及属性值如下表所示。如果想修改这些值，请参考配置项中的`LDAP_ADD_ATTRS`属性

| 属性名                         | 值                                                  |
| ------------------------------ | --------------------------------------------------- |
| DN                             | `{LDAP_ATTR_UID}=用户名,{LDAP_ADD_USER_BASE}`       |
| `LDAP_ATTR_UID`                | 用户名                                              |
| `LDAP_ATTR_NAME`               | 用户姓名                                            |
| sn                             | 用户名                                              |
| loginShell                     | /bin/bash                                           |
| objectClass                    | ["inetOrgPerson", "posixAccount", "shadowAccount"]  |
| homeDirectory                  | `LDAP_ADD_HOME_DIR`，其中的`{username}`替换为用户名 |
| uidNumber                      | 数据库中的用户项的id + `LDAP_ADD_UID_START`         |
| gidNumber                      | 数据库中的用户项的id + `LDAP_ADD_UID_START`         |
| `LDAP_ATTR_MAIL`（如果设置了） | 用户的邮箱                                          |

3. 创建一个新的entry作为group，其DN以及属性值如下表所示。

| 属性名      | 值                                                       |
| ----------- | -------------------------------------------------------- |
| DN          | `{LDAP_ATTR_GROUP_USER_ID}=用户名,{LDAP_ADD_GROUP_BASE}` |
| objectClass | ["posixGroup"]                                           |
| memberUid   | 用户名                                                   |
| gidNumber   | 同用户的uidNumber                                        |

4. 设置新用户的密码为用户输入的密码


## 安装并配置LDAP认证服务

### 部署redis

LDAP认证系统将认证信息存放在redis中，所以在部署认证系统之前需要先部署redis。

在`docker-compose.yml`的`services`块中添加以下条目:

```yaml title=docker-compose.yml
  redis:
    image: redis:alpine
    restart: unless-stopped
    ports:
      - 6379:6379
```

运行`docker compose up -d`启动redis。

### 部署并配置LDAP认证服务

在`docker-compose.yml`的`services`块中添加以下条目:

```yaml title=docker-compose.yml
  auth:
    image: %CR_URL%/auth
    restart: unless-stopped
    environment:
      # TODO 增加配置
```

增加好配置后，运行`docker compose up -d`启动认证系统。

## LDAP快速配置脚本

我们提供以下两个脚本可以用来在**CentOS 7**环境快速安装和配置LDAP服务器

- [provider.sh](%REPO_FILE_URL%/scripts/ldap/provider.sh): 用于配置LDAP服务器
- [client.sh](%REPO_FILE_URL%/scripts/ldap/client.sh): 用于配置LDAP客户端

请下载这两个文件，修改两个文件开头部分的相关配置（`Start Configuratin Part`和`End Configuration Part`之间的变量），运行即可。

如果您使用provider.sh脚本配置您的服务器，您的LDAP相关配置为如下。其中`{变量}`替换为provider.sh中的对应变量值。

```yaml
      LDAP_URL: ldap://LDAP服务器地址
      LDAP_BIND_DN: cn=Manager,ou={ou},o={dn}
      LDAP_BIND_PASSWORD: {adminPasswd}
      LDAP_SEARCH_BASE: "ou={ou},o={dn}"
      LDAP_FILTER: "(uid=*)"
      LDAP_ADD_USER_BASE: "ou=People,ou={ou},o={dn}"
      LDAP_ADD_GROUP_BASE: "ou=Group,ou={ou},o={dn}"
      LDAP_ATTR_UID: uid
      LDAP_ATTR_GROUP_USER_ID: cn
      LDAP_ATTR_NAME: cn
      LDAP_ATTR_MAIL: mail
```

## LDAP镜像

您还可以使用我们提供的已经配置好的LDAP docker镜像进行体验。注意，此镜像仅用于测试和功能体验，请勿用于生产环境！

```bash
# 在整个项目的根目录构建镜像 
docker build -f dev/ldap/Dockerfile -t ldap .

# 启动镜像。服务在389端口监听。
# 管理员用户为cn=Manager,ou=hpc,o=pku，密码为admin
docker run -p 389:389 ldap
```