---
sidebar_position: 3
title: LDAP 
---

# LDAP认证系统

本节介绍使用内置认证系统并使用LDAP进行用户认证。

LDAP认证系统支持的功能如下表：

| 功能             | 是否支持 |
| ---------------- | -------- |
| 用户登录         | 是       |
| 用户创建         | 是       |
| 用户名和姓名验证 | 是       |
| 修改密码         | 是       |


## LDAP认证流程

为了更好的理解并配置LDAP认证系统，本节将介绍各个操作时，LDAP认证系统所进行的操作。下文中，代码块（如`ldap.bindDn`）为配置文件`config/auth.yml`中的对应值。请确认您的LDAP配置兼容这里所称的流程。

### 登录

当用户登录时，认证系统获得用户的用户名和密码，进行以下操作：

1. 使用`ldap.bindDn`和`ldap.bindPassword`作为用户名和密码与向LDAP服务器所在的`ldap.url`发起bind请求
2. bind成功后，以`ldap.searchBase`为搜索根，以sub模式，以`ldap.filter` 和 (`ldap.attrs.uid`等于输入的用户名) 为筛选条件搜索节点
   1. 如果搜索结果为空，则登录失败
   2. 如果搜索节点有多个，取第一个结果
3. 以**上一个结果的DN**以及**输入的密码**作为用户名和密码，与LDAP服务器发起bind请求
   1. 如果bind失败，则登录失败
4. 登录成功。生成一个UUID作为token，将token与**输入的用户名**存入redis
5. 重定向到用户在登录时，通过querystring指定的callback URL，并传入`token={token}`作为querystring参数

### 创建用户

当用户在运营系统中创建后，认证系统获得新用户的用户名、用户姓名、密码和邮箱，进行以下操作

1. 使用`ldap.bindDn`和`ldap.bindPassword`作为用户名和密码与向LDAP服务器所在的`ldap.url`发起bind请求
2. 创建一个新的entry作为用户，其DN以及属性值如下表所示。如果想修改这些值，请参考配置项中的`ldap.addUser.extraProps`属性

| 属性名                          | 值                                                     |
| ------------------------------- | ------------------------------------------------------ |
| DN                              | `{ldap.attrs.uid}=用户名,{ldap.addUser.userBase}`      |
| `ldap.attrs.uid`                | 用户名                                                 |
| `ldap.attrs.name`               | 用户姓名                                               |
| sn                              | 用户名                                                 |
| loginShell                      | /bin/bash                                              |
| objectClass                     | ["inetOrgPerson", "posixAccount", "shadowAccount"]     |
| homeDirectory                   | `ldap.addUser.homeDir`，其中的`{{ username }}`替换为用户名 |
| uidNumber                       | 数据库中的用户项的id + `ldap.addUsaer.uidStart`        |
| gidNumber                       | 数据库中的用户项的id + `ldap.addUser.uidStart`         |
| `ldap.attrs.mail`（如果设置了） | 用户的邮箱                                             |

3. 创建一个新的entry作为group，其DN以及属性值如下表所示。

| 属性名      | 值                                                         |
| ----------- | ---------------------------------------------------------- |
| DN          | `{ldap.attrs.groupUserId}=用户名,{ldap.addUser.groupBase}` |
| objectClass | ["posixGroup"]                                             |
| memberUid   | 用户名                                                     |
| gidNumber   | 同用户的uidNumber                                          |

4. 设置新用户的密码为用户输入的密码

## 安装并配置LDAP认证服务

### 编写配置文件

在配置文件目录中创建文件`config/auth.yml`，并输入以下内容：

```yaml title="config/auth.yml"
# 指定使用认证类型为LDAP
authType: ldap

# 在此部分输入LDAP的配置
ldap:

```

接下来的的配置将需要写入到此文件的`ldap`部分中。

### 部署redis

LDAP认证系统将认证信息存放在redis中，所以在部署认证系统之前需要先部署redis。

在`docker-compose.yml`的`services`块中添加以下条目:

```yaml title=docker-compose.yml
  redis:
    image: redis:alpine
    restart: unless-stopped
```

运行`docker compose up -d`启动redis。

### 部署认证服务

在`docker-compose.yml`的`services`块中添加以下条目:

```yaml title=docker-compose.yml
  auth:
    image: %CR_URL%/auth
    restart: unless-stopped
    volumes:
      - ./config:/etc/scow
```

增加好配置后，运行`docker compose up -d`启动认证系统。

## LDAP快速配置脚本

我们提供以下两个脚本可以用来在**CentOS 7**环境快速安装和配置LDAP服务器

- [provider.sh](%REPO_FILE_URL%/scripts/ldap/provider.sh): 用于配置LDAP服务器
- [client.sh](%REPO_FILE_URL%/scripts/ldap/client.sh): 用于配置LDAP客户端

请下载这两个文件，修改两个文件开头部分的相关配置（`Start Configuratin Part`和`End Configuration Part`之间的变量），运行即可。

如果您使用provider.sh脚本配置您的服务器，您的LDAP相关配置为如下。其中`{变量}`替换为provider.sh中的对应变量值。

```yaml
      AUTH_TYPE: ldap
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