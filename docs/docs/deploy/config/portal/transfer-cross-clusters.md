---
sidebar_position: 4
title: 跨集群文件传输功能（可选）
---

# 跨集群文件传输功能（可选）

跨集群文件传输功能能够让用户在不同集群甚至不同中心的集群之间传输文件，其传输方式使用的是自研的并行传输软件scow-sync。

## 配置

### 1. 为每个集群添加传输节点

#### 网络区分

通常情况下，同属一个集群的所有节点，均在同一个子网下，我们称之为**集群内网**。例如：登录节点访问计算结点便是通过集群内网。

不同集群之间的节点，互相通常是访问不到的，除非接入到更大的网络之中，我们称之为**集群间可达网**。

任何机器都可以通过网络访问到的地址，为公网地址，我们称之为**互联网公网**。

网络范围排序：互联网公网 > 集群间可达网 > 集群内网

#### 配置

在跨集群传输功能的配置中，每个集群需要有一个专门用来做文件传输的节点TransferNode，该TransferNode要求具有**集群间可达网**的地址，也就是说接入SCOW系统的所有集群的传输节点之间彼此是可以访问的。传输节点TransferNode可以和登录节点LoginNode是同一个节点。

准备好传输节点后，需要将其接入到scow集群中，具体方式为修改集群配置文件`config/clusters/xxx.yaml`，在yaml文件最后添加transferCrossCluster模块，添加enabled和transferNode配置，enabled为true表示开启该功能，transferNode配置格式为ip:port，如果不配置port默认为22端口。

```yaml title="config/clusters/xxx.yaml"
# 集群显示名称
displayName: ...

# 指定slurm配置
slurm: ...
 
# 跨集群传输模块，可选功能
crossClusterFilesTransfer:
  enabled: true
  # 传输结点，要求是公网ip，如不配置端口号则默认为22
  transferNode: 10.2.3.1:22222
```

### 2. 建立scow节点到传输节点的root用户免密

在scow节点运行以下命令

```bash
# 执行以下命令，输入密码后设置免密成功
ssh-copy-id root@[TransferNodeIP]
```

### 3. 在传输节点上安装scow-sync传输软件

```bash
# 以root身份登录传输节点
ssh -p [TransferNodePort] root@[TransferNodeIP]
# 安装scow-sync到/data/software目录
cd /data/software
git clone https://github.com/PKUHPC/scow-sync.git
# 执行安装脚本
sudo bash install.sh
```

### 4. 配置scow-sync的输出路径

配置scow-sync的输出路径为可选操作，默认的输出路径为~/scow/.scow-sync

进入scow-sync文件夹

```bash
cd /data/software/scow-sync
```

修改config.py，以下为默认配置

```python
SCOWSYNC_PATH = os.path.expanduser('~/scow/.scow-sync')  
LOG_PATH = os.path.join(SCOWSYNC_PATH, 'scow-sync.log')
ERROR_PATH = os.path.join(SCOWSYNC_PATH, 'scow-sync.err')
```

注：SCOWSYNC_PATH的路径必须为以~开头的用户路径。SCOWSYNC_PATH文件夹内保存了文件传输进度等信息，不同用户之间相互无权访问。