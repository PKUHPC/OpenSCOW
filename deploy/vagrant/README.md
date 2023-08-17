# scow-vagrant：slurm+SCOW集群一键部署

## 注意

此仓库的内容由[PKUHPC/SCOW](https://github.com/PKUHPC/SCOW)的`deploy/vagrant`的目录通过GitHub Actions自动生成。如果需要提交issue或者PR，请提交到SCOW仓库中。

## 介绍

本项目面向<font color=red size=5>**开发**</font>和<font color='red' size=5>**测试**</font>人员，基于Vagrant，采用VirtualBox作为Provider，提供slurm+SCOW集群一键部署方案，极大简化了部署流程和部署门槛。部署slurm+SCOW四节点集群，节点角色及默认配置如下表所示：

| 节点名称/角色 |                           主要服务                           |     私网IP     | 配置 |
| :-----------: | :----------------------------------------------------------: | :------------: | :--: |
|     scow      |         scow：portal、mis、auth、gateway，audit               | 192.168.88.100 | 4C4G |
|     slurm     | slurmdbd、slurmctld、slurmd、mariadb、nfs-server、slapd、sssd | 192.168.88.101 | 2C2G |
|     login     |         slurmd、sssd、nfs、Xfce、KDE、MATE、cinnamon         | 192.168.88.102 | 2C2G |
|     cn01      |         slurmd、sssd、nfs、Xfce、KDE、MATE、cinnamon         | 192.168.88.103 | 2C2G |

## 使用

### 集群一键部署命令

```shell
vagrant up
```

> - 第一次部署需要从vagrant clould拉取vagrant镜像，速度会比较慢，请耐心等待。
>

### 集群初始化

> 初始化地址：http://192.168.88.100/mis/init/  用户名/密码：demo_admin/demo_admin

进入初始化页面，选择创建初始管理员用户，将`demo_admin`设置为管理员用户。后续用户、账户设置请参考本项目操作手册。

### SCOW运维操作

```shell
#登录到集群scow节点
vagrant ssh scow

# 输入root用户密码，密码为：vagrant

# 进入scow部署目录
/root/scow/scow-deployment

# 更新cli
./cli update --branch master

# 拉取最新镜像
./cli compose pull

# 重启服务
./cli compose down
./cli compose up -d
```

### 集群一键销毁命令

```shell
vagrant destroy  
```

## 更多文档

###  更多文档

- [vagrant环境搭建](https://pkuhpc.github.io/SCOW/docs/deploy/get-started/vagrant/vagrant-env)
- [自定义部署](https://pkuhpc.github.io/SCOW/docs/deploy/get-started/vagrant/customization)
- [vagrant镜像制作](https://pkuhpc.github.io/SCOW/docs/deploy/get-started/vagrant/vagrant-env)
- [FAQ](https://pkuhpc.github.io/SCOW/docs/deploy/get-started/vagrant/faq)

## 授权协议

SCOW 使用 [木兰宽松许可证, 第2版](http://license.coscl.org.cn/MulanPSL2) 开源协议。