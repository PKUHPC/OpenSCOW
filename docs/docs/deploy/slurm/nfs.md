---
sidebar_label: 'NFS安装和配置'
title: NFS安装和配置
sidebar_position: 4
---

本方案以NFS作为共享存储。

## 1. 安装NFS服务端

选择一台机器作为NFS的服务端，例如选择服务节点`manage01`，IP为`192.168.29.106`。

**安装NFS、RPC服务**

```PowerShell
yum install -y nfs-utils rpcbind
```

**创建共享目录**

```PowerShell
# 此处需要执行权限
mkdir /data
chmod 755 /data
```

:::tip

若需单独挂载一个磁盘作为共享目录，可参考该链接[数据盘挂载](./mount-disk.md) 

:::

**修改配置文件`vim /etc/exports`，添加如下内容**

```PowerShell
/data *(rw,sync,insecure,no_subtree_check,no_root_squash)
```

**启动RPC，NFS服务**

```Bash
systemctl start rpcbind 
systemctl start nfs-server 

systemctl enable rpcbind 
systemctl enable nfs-server
```

**查看服务端是否正常加载配置文件**

```PowerShell
showmount -e localhost

# 有如下输出
Export list for localhost:
/data *
```

## 2. 客户端搭建

需要使用共享存储的节点包括所有的登录节点和计算节点

:::tip

以下操作在所有登录节点和计算节点上执行

:::

**安装NFS客户端nfs-utils**

```PowerShell
yum install nfs-utils -y
```

**查看服务端可共享的目录**

```PowerShell
# 192.168.29.106为NFS服务端IP
showmount -e 192.168.29.106

# 有如下输出
Export list for 192.168.29.106:
/data *
```

**挂载服务端共享目录**

```PowerShell
# 创建目录
mkdir /data
#将共享存储/data 挂载至192.168.29.106服务器的/data目录下
mount 192.168.29.106:/data /data -o proto=tcp -o nolock

# 设置开机自动挂载
vim /etc/fstab
# 在文档末尾添加
192.168.29.106:/data /data nfs rw,auto,nofail,noatime,nolock,intr,tcp,actimeo=1800 0 0
```

**查看挂载**

```PowerShell
df -h |grep data

# 有如下输出
192.168.29.106:/data     79G   56M   75G   1% /data
```

## 3. 使用

**测试**

```PowerShell
# 例如在NFS服务端节点(其他节点也可以)写入一个测试文件
echo "hello nfs server" > /data/test.txt

cat /data/test.txt
# 在服务端节点或客户端节点均可以查看以下内容
hello nfs server
```

**创建目录**

```PowerShell
# 创建home目录作为用户家目录的集合，可自定义
mkdir /data/home

# 创建software目录作为交互式应用的安装目录
mkdir /data/software
```