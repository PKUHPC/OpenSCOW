---
sidebar_position: 4
title: 跨集群文件传输功能（可选）
---

# 跨集群文件传输功能（可选）

跨集群文件传输功能能够让用户在不同集群甚至不同中心的集群之间传输文件，其传输方式使用的是自研的并行传输软件scow-sync。

## 配置

### 1. 为每个集群添加传输节点

每个集群需要有一个专门用来做文件传输的节点TransferNode，该TransferNode要求只拥有**互联网公网地址**。该TransferNode可以是登录节点LoginNode，但同样要求具有公网地址。
准备好传输节点后，需要将其接入到scow集群中，具体方式为修改集群配置文件`scow/scow-deployment/config/clusters/xxx.yaml`，在yaml文件最后添加transferCrossCluster模块，添加enabled和transferNode配置，enabled为true表示开启该功能，transferNode配置格式为ip:port，如果不配置port默认为22端口。

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