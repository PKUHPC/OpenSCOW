---
slug: update-deployment
title: socw-deployment平滑升级指导
authors: [huangjun]
tags: [scow, socw-deployment]

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

为避免不确定性因素或操作失误造成升级失败丢失数据，建议备份如下数据：

```shell
# 1. 创建备份目录
mkdir /path/to/backup

# 2. 备份scow业务配置
cp -r ./config /path/to/backup
# 3. 备份部署的环境变量
cp .env /path/to/backup

# 4. 备份数据库文件
# 查看备份目录：根据docker-compose文件，一般默认目录为：/var/lib/docker/volumes/scow-deployment_db_data/_data，也可根据如下命令查看
docker inspect scow-deployment-db-1 | grep Mounts -A 10
#...
            "Mounts": [
                {
                    "Type": "volume",
                    "Source": "scow-deployment_db_data",
                    "Target": "/var/lib/mysql",
                    "VolumeOptions": {}
                }
            ],
            "MaskedPaths": [
                "/proc/acpi",
                "/proc/config.gz",
--
        "Mounts": [
            {
                "Type": "volume",
                "Name": "scow-deployment-db_data",
                "Source": "/var/lib/docker/volumes/scow-deployment_db_data/_data",
                "Destination": "/var/lib/mysql",
                "Driver": "local",
                "Mode": "z",
                "RW": true,
                "Propagation": ""
            }
#...
# 可以看出备份目录为：/var/lib/docker/volumes/scow-deployment_db_data/_data，备份该目录
cp -r /var/lib/docker/volumes/scow-deployment_db_data/_data /path/to/backup
```

## 3.  升级

拉取master分支最新代码：

```shell
# 为避免原目录中存在一些自定义文件影响，建议克隆一份最新代码
git clone https://github.com/PKUHPC/scow-deployment.git
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
# 1. 从备份处拷贝scow业务配置模板文件目录
cp -r /path/to/backup/config ./

# 2. 复制配置文件
cp config-example.py config.py

# 3. 配置参数
# 根据和备份的.env文件和config.py中的参数说明，修改config.py文件中的参数

```

服务启动与停止：

```shell
# 启动服务
./compose.sh up -d

# 停止服务
./compose.sh down
```

详细说明可参考`PKUHPC/scow-deployment`项目的[README.md](https://github.com/PKUHPC/scow-deployment/blob/master/README.md)。

