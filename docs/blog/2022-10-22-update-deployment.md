---
slug: update-to-python-deployment
title: scow-deployment平滑升级指导
authors: [huangjun]
tags: [scow, scow-deployment]

---

上一个版本，`PKUHPC/scow-deployment`项目是纯通过`Docker Compose`实现的，主要用到了`Docker Compose`内置的`profile`功能、读取环境变量以及变量替换功能来实现类似不同配置。但是`Docker Compose`的这些功能较弱，无法满足未来更多自定义需求。

为简化部署的参数配置，同时为用户提供更易懂和灵活的参数配置，最新版本的`PKUHPC/scow-deployment`项目使用`python`动态生成`Docker Compose`文件，根据用户的需求生成更易理解的`Docker Compose`文件。

接下来，主要介绍如何平滑的从旧版本升级至新版本。

## 1. 停止scow服务

```shell
# 进入scow-deployment项目目录
cd scow-deployment

# 停止scow服务
docker-compose down
```

## 2. 备份配置文件

主要备份`.env`配置文件：

```shell
# 1. 创建备份目录
mkdir /path/to/backup

# 2. 备份部署的环境变量
cp .env /path/to/backup

```

## 3.  升级

拉取master分支最新代码：

```shell
cd /path/to/scow-deployment
# 同步最新代码
git pull
```

目录结构如下：

```shell
tree -L 1
├── compose.sh				# 程序执行入口，执行该脚本会生成docker-compose.json、db.sh文件
├── config-example			# scow业务配置模板文件目录
├── config-example.py		# scow系统部署参数配置文件模板
├── fluent					# fluent配置文件存放目录
├── generate.py				# 部署配置文件生成python脚本
└── README.md
```

编写配置文件:

```shell
# 1. 复制配置文件
cp config-example.py config.py

# 2. 配置参数
# 根据和备份的.env文件和config.py中的参数说明，修改config.py文件中的参数

```

服务启动与停止：

```shell
# 启动服务
./compose.sh up -d

# 停止服务
./compose.sh down
```

> `./compose.sh`支持所有基于`Docker Compose`文件的`docker-compose`命令，如：up、down、ps、restart等。

详细说明可参考`PKUHPC/scow-deployment`项目的[README.md](https://github.com/PKUHPC/scow-deployment/blob/master/README.md)。

