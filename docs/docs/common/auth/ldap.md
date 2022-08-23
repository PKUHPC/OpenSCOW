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

## LDAP认证要求和流程

为了更好的理解并配置LDAP认证系统，本节将介绍各个操作时，LDAP认证系统所进行的操作。请确认您的LDAP配置兼容这里所称的流程

下文中，代码块（如`ldap.bindDn`）为配置文件`config/auth.yml`中的对应值。

### 使用LDAP登录集群

要使用LDAP进行SCOW系统的用户认证，您必须配置LDAP服务器和集群中的每个节点，使得集群中的任何节点都可以使用LDAP用户节点的`ldap.attrs.uid`对应的属性的值和密码作为用户名和密码登录。请参考[client.sh](%REPO_FILE_URL%/dev/ldap/client.sh)配置使用LDAP服务器登录Linux节点。

另外，我们还要求

- 每个需要登录集群的用户节点都对应一个用户组(group)的节点，所对应的Linux用户属于用户组节点所对应的Linux用户组
- 用户节点的`ldap.attrs.uid`属性的值 == 组节点的`ldap.attrs.groupUserId`属性的值
- 用户节点的uidNumber, gidNumber和组节点的gidNumber的值相同

### 登录

当用户登录时，认证系统获得用户输入的用户名和密码，进行以下操作：

1. 使用`ldap.bindDn`和`ldap.bindPassword`作为用户名和密码，向LDAP服务器所在的`ldap.url`发起bind请求
2. bind成功后，以`ldap.searchBase`为搜索根，以sub模式，以`ldap.filter` && (`ldap.attrs.uid`等于输入的用户名) 为筛选条件搜索节点
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
| uidNumber                       | 数据库中的用户项的id + `ldap.addUser.uidStart`        |
| gidNumber                       | 数据库中的用户项的id + `ldap.addUser.uidStart`         |
| `ldap.attrs.mail`（如果设置了） | 用户的邮箱                                             |

3. 创建一个新的entry作为新用户的group，其DN以及属性值如下表所示。

| 属性名      | 值                                                         |
| ----------- | ---------------------------------------------------------- |
| DN          | `{ldap.attrs.groupUserId}=用户名,{ldap.addUser.groupBase}` |
| objectClass | ["posixGroup"]                                             |
| memberUid   | 用户名                                                     |
| gidNumber   | 同用户的uidNumber                                          |

4. 设置新用户的密码为用户输入的密码


## 配置LDAP认证服务

在`config/auth.yml`中输入以下内容，并根据情况配置。

```yaml title="config/auth.yml"
# 指定使用认证类型为LDAP
authType: ldap

# 在此部分输入LDAP的配置
ldap:
  # LDAP服务器地址。必填
  url: ldap://LDAP服务器地址

  # 进行LDAP操作的用户DN。默认为空
  # bindDN: ""
  # 进行LDAP操作的用户密码。默认为空
  # bindPassword: ""

  # 在哪个节点下搜索要登录的用户。默认为空
  # searchBase: ""
  # 搜索登录用户时的筛选器。必填
  userFilter: "(uid=*)"

  # 添加用户的相关配置。必填
  addUser:
    # 增加用户节点时，把用户增加到哪个节点下
    userBase: "ou=People,ou={ou},o={dn}"
    # 增加用户节点时，把用户对应的组增加到哪个节点下
    groupBase: "ou=Group,ou={ou},o={dn}"

    # 用户的homeDirectory值。使用{{ userId }}代替新用户的用户名。默认如下
    homeDir: /nfs/{{ userId }}

    # 是否应该把新用户加到哪个LDAP组下。如果不填，则不加
    # userToGroup: group

    # uid从多少开始。生成的用户的uid等于此值加上用户账户中创建的用户ID。创建的Group的gid和uid和此相同。
    # 默认如下
    # uidStart: 66000

    # 用户项除了id、name和mail，还应该添加哪些属性。类型是个dict
    # 如果这里出现了名为uid, name或email的属性，这里的值将替代用户输入的值。
    # 属性值支持使用 {{ LDAP属性值key }} 格式来使用用户填入的值。
    # 例如：{ sn: "{{ cn }}" }，那么添加时将会增加一个sn属性，其值为cn的属性，即为用户输入的姓名
    # extraProps: 
    #   key: value

  # 属性映射
  attrs:
    # LDAP中对应用户ID的属性名
    uid: uid
    # LDAP中用户对应的组的实体表示用户ID的属性名
    groupUserId: cn
    # 此字段用于在创建用户的时候把姓名信息填入LDAP，以及验证ID和姓名是否匹配。
    # 如果不填写，则系统将不会验证ID和姓名是否匹配，且不会再创建用户的时候把姓名信息填入LDAP。
    # name: cn

    # LDAP中对应用户的邮箱的属性名。可不填。此字段只用于在创建用户的时候把邮件信息填入LDAP。
    # mail: mail
```

增加好配置后，运行`docker compose restart`重启系统即可。

## LDAP快速配置脚本

我们提供以下两个脚本可以用来在**CentOS 7**环境快速安装和配置LDAP服务器

- [provider.sh](%REPO_FILE_URL%/scripts/ldap/provider.sh): 用于配置LDAP服务器
- [client.sh](%REPO_FILE_URL%/scripts/ldap/client.sh): 用于配置LDAP客户端

请下载这两个文件，修改两个文件开头部分的相关配置（`Start Configuratin Part`和`End Configuration Part`之间的变量），运行即可。

如果您使用provider.sh脚本配置您的服务器，您的LDAP相关配置为如下。其中`{变量}`替换为provider.sh中的对应变量值。

```yaml title="config/auth.yml"

# ...其他配置

authType: ldap
ldap:
  url: ldap://LDAP服务器地址
  bindDN: cn=Manager,ou={ou},o={dn}
  bindPassword: {adminPasswd}
  searchBase: "ou={ou},o={dn}"
  userFilter: "(uid=*)"
  addUser:
    userBase: "ou=People,ou={ou},o={dn}"
    groupBase: "ou=Group,ou={ou},o={dn}"
  attrs:
    uid: uid
    groupUserId: cn
    name: cn
    mail: mail
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