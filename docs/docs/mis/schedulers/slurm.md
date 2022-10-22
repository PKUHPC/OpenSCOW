---
sidebar_position: 1
title: slurm
---

# 配置使用slurm的集群

## 选定slurm节点和部署slurm.sh

在集群中选定一个节点作为**slurm节点**。此节点需要满足以下条件：

- **服务节点**可以以root用户SSH免密登录到此节点
- 此节点上安装并配置好了slurm的客户端程序，如`sacctmgr`、`squeue`等。

我们建议在slurm集群的manager节点上同时配置客户端程序，并使用此节点为**slurm节点**。
- 在项目启动后，系统将自动给slurm节点上传一个slurm.sh脚本，用于进行一些slurm操作。具体上传的位置可以在集群配置中进行配置。

## 修改集群配置

在`config/clusters/{使用slurm的集群的ID}.yml`中，修改配置

```yaml title="config/clusters/{使用slurm的集群的集群ID}.yml"
# ...
slurm:
  #....
  mis:
    # 部署slurm.sh的机器的地址
    managerUrl: haha
    # slurm.sh在机器中的绝对地址,每次系统启动时，会自动将slurm.sh文件复制到scriptPath指定路径上
    scriptPath: /test/slurm.sh
    # slurmdbd的数据库密码
    dbPassword: password
    # slurm中这个集群的集群名
    clusterName: hpc01
```

## 导入已有用户信息

如果您已有一个slurm集群，在管理系统部署完成后，可以使用本功能将slurm中的用户信息导入本系统。

把[slurm-users.py](%REPO_FILE_URL%/apps/mis-server/scripts/slurm-users.py)复制到`slurm.sh`的目录下，运行以下命令，获得一个`users.json`文件。

```bash
MYSQL_PASSWORD={slurmdbd的数据库密码} CLUSTER_NAME={slurm中这个集群的集群名} python3 slurm-users.py
```

`users.json`的文件初始数据格式如下。不存在名字的用户的初始名字为自己的ID。

请在导入前确认每个账户都有一个用户的包含`owner`字段。如果没有，请手动将账户的拥有者的用户后面增加`,owner`。在执行`slurm-users.py`的过程中，如果遇到某个账户不存在拥有者，系统将会给出警告。

`slurm-users.py`默认将`用户ID == a_账户ID`的用户设置为拥有者。如果这不满足您的需求，请在`slurm-users.py`中修改。

```json5
{
    "accounts": {
        "a_abc": { // 账户
          "abc": "allowed!,owner", // 用户ID：allowed!表示用户未被封锁，owner表示此用户为账户的拥有者 
          "yhh": "blocked!" // 用户ID：blocked!表示用户被封锁
        }
    },
    "names": {
      "abc": "abc的名字"
    }
}
```

获取`users.json`之后，在系统初始化时，或者系统初始化后使用平台管理员用户登录后选择**平台管理**->**导入用户**，将`users.json`的内容复制进去。如果需要将新加入的账户都加入白名单中，请勾选`将所有账户加入白名单`。点击确定，即可将所有账户导入默认租户中。


