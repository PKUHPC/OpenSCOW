---
sidebar_position: 3
title: 自定义部署
---

## 1. 如何修改节点私网IP

本方案各节点IP使用的是`private_network`模式(Host-Only)，若不与其他虚机IP冲突，可不需要修改直接使用默认即可。如需要修改节点IP，可参照如下操作：

**(1) Vagrantfile修改：**

通过修改`Vagrantfile`文件`vm_list`下各节点的`eth1`属性，修改集群中各节点 使用的IP，需保证设置的各节点IP在同一局域网内。

**(2) slurm配置文件修改：**

- `slurm\slurm.conf`文件中的nodes配置部分，将各节点IP修改为与`vm_list`中配置的一致；
- `slurm\ldap_client.sh`文件中`ServHost`改为slurm节点IP；
- `slurm\nfs_client.sh`文件中的`192.168.88.101`改为slurm节点IP。

**(3) SCOW配置文件修改：**

- `scow\scow-deployment\config\auth.yml`文件中的`ldap.url`的IP改为slurm节点IP；
- `scow\scow-deployment\config\mis.yaml`文件中`fetchJobs.db.host`改为scow节点IP；
- `scow\scow-deployment\config\clusters\hpc01.yaml`文档中`slurm.mis.managerUrl`改为slurm节点IP。

**(4) export job配置文件修改：**

`scow\export-jobs\config.py`文件中的`cluster_db_conf.host`改为slurm节点IP，`mgt_db_conf.host`scow节点IP。

以上配置修改完成之后执行部署命令：

```shell
vagrant up
```

## 2. 如何新增计算节点

以添加计算节点`cn02`为例，`Vagrantfile`文件`vm_list`中复制一份`cn01`的配置，并做如下修改：

```shell
    {
        :name => "cn02",
        :eth1 => "192.168.88.104",
        :mem => "4096",
        :cpu => "4",
        :sshport => 22234,
        :box => "icode/slurm_compute",
		:role => "slurm",
        :is_service_node => false
    }
```

> 注意修改name，eth1，sshport的值，可不修改其他属性值。

`slurm\slurm.conf`文件中修改计算节点和分区配置信息部分：

```shell
# NODES 配置部分将cn02节点加入 
NodeName=cn0[1-2] NodeAddr=192.168.88.10[3-4]  CPUs=4 CoresPerSocket=2 ThreadsPerCore=1 RealMemory=3500 Procs=1 State=UNKNOWN

# PARTITIONS 配置部分将cn02节点加入              
PartitionName=compute Nodes=cn0[1-2] Default=YES MaxTime=INFINITE State=UP

```

`scow\scow-deployment\config\clusters\hpc01.yaml`修改节点和分区配置：

```yaml
# ...
slurm:
  loginNodes:
    - login
 
  computeNodes:
    - cn01
    - cn02 		# 增加cn02

  partitions:
    - name: compute
      # 分区内节点数修改为2
      nodes: 2

# ...
```

以上配置修改完成之后执行部署命令：

```shell
vagrant up
```






