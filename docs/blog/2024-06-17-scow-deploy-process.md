---
slug: scow-deploy-process
title: SCOW部署及运维指引
authors: [huangjun]
tags: [scow, scow-deployment]
---



:::tip

> **前提条件：**

1. **slurm集群准备完毕，版本为`21.08.4`及以上，且开启了[Accounting](https://slurm.schedmd.com/accounting.html#database-configuration)功能**，部署slurm集群可参考[slurm集群部署实践](/docs/hpccluster)；
2. **slurm集群各节点实现了LDAP认证**，提供两个基于CentOS7的脚本用来快速搭建和配置LDAP，修改两个文件开头部分的相关配置（`Start Configuratin Part`和`End Configuration Part`之间的变量），运行即可：
   - [provider.sh](https://github.com/PKUHPC/SCOW/blob/master/dev/ldap/provider.sh): 用于配置LDAP服务器
   - [client.sh](https://github.com/PKUHPC/SCOW/blob/master/dev/ldap/client.sh): 用于配置LDAP客户端
3. **slurm集群挂载了并行文件系统**，例如lustre、gpfs等，提供[NFS的搭建](/docs/hpccluster/nfs)供参考；
4. 登录节点和计算节点安装TurboVNC，版本3.0以上，[官方安装教程](https://turbovnc.org/Downloads/YUM)；
5. 登录节点安装桌面，例如Xfce、KDE、MATE等。

:::



# 1. 部署流程

## 1.1 准备SCOW部署节点

建议单独准备一个节点用于部署SCOW，要求如下：

- 最小配置：8C16G，推荐配置(生产级)：16C32G；
- 与slurm集群各节点网络可达，或者至少与slurm集群登录节点和管理节点网络可达([代理网关方案](/docs/deploy/config/portal/proxy-gateway))。

安装docker和docker-compose，以下给出基于yum安装方式供参考：

```shell
# 1. 安装Docker 
yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2 
# 设置稳定存储库
yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo   
# 安装
yum install docker-ce -y
# 启动Docker CE并设置开机启动
systemctl start docker
systemctl enable docker

# 2. 安装docker-compose
curl -L "https://github.com/docker/compose/releases/download/v2.7.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
#赋权
chmod +x /usr/local/bin/docker-compose
# 验证
docker-compose --version
```

## 1.2 编译和部署适配器

[slurm适配器安装部署文档](https://github.com/PKUHPC/scow-slurm-adapter/blob/master/docs/deploy.md)。

:::tip

适配器运行依赖本机glibc版本，强烈建议在与运行环境(slurm管理节点)一致的环境中下载源码[自行编译](https://github.com/PKUHPC/scow-slurm-adapter/blob/master/docs/deploy.md#12-下载代码编译生成二进制文件自己编译生成二进制文件)。

:::

## 1.3 配置SCOW

下载`scow-cli`，[scow-cli使用参考](/docs/deploy/install/scow-cli)。

配置文件及说明：

| 配置文件          | 功能说明                                                     | 说明                                                         | 备注                                       |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------ |
| install.yaml      | SCOW安装文件                                                 | [最简配置参考](https://github.com/PKUHPC/SCOW/blob/master/apps/cli/assets/init/install.yaml) |                                            |
| `{集群ID}`.yaml   | [集群配置文件](/docs/deploy/config/cluster-config)           | [最简配置参考](https://github.com/PKUHPC/SCOW/blob/master/apps/cli/assets/init/config/clusters/hpc01.yaml) | 支持多集群，一个集群一个配置文件           |
| auth.yaml         | [认证配置文件](/docs/deploy/config/auth/ldap)                | [最简配置参考](https://github.com/PKUHPC/SCOW/blob/master/apps/cli/assets/init/config/auth.yml) | 所有集群同一个认证系统                     |
| mis.yaml          | [管理系统配置文件](/docs/deploy/config/mis/intro)            | 可使用默认配置                                               |                                            |
| portal.yaml       | [门户系统配置文件](/docs/deploy/config/portal/intro#编写门户服务配置) | 可使用默认配置                                               | 若登录节点不是安装的xfce，需要对应进行修改 |
| audit.yaml        | [操作日志配置文件](/docs/deploy/config/audit/intro#编写后端服务配置) | 可使用默认配置                                               |                                            |
| common.yaml       | 公共配置文件                                                 | 可使用默认配置                                               |                                            |
| clusterTexts.yaml | 集群说明配置文件                                             | 可使用默认配置                                               |                                            |
| ui.yaml           | ui配置文件                                                   | 可使用默认配置                                               |                                            |

## 1.4 其他配置(可选)

- [交互式应用](/docs/deploy/config/portal/apps/intro)
- [为交互式应用配置图标](/docs/deploy/config/portal/apps/configure-app-logo)
- [多集群交互式应用配置](/docs/deploy/config/portal/apps/configure-cluster-apps)
- [自定义logo](/docs/deploy/config/portal/customization/dashboard)
- [跨集群文件传输功能](/docs/deploy/config/portal/transfer-cross-clusters)
- [代理网关节点](/docs/deploy/config/portal/proxy-gateway)
- [集群监控配置](/docs/deploy/config/mis/cluster-monitor)
- [网关配置](/docs/deploy/config/gateway/config)
- [自定义相对路径](/docs/deploy/config/customization/basepath)
- [自定义前端主题](/docs/deploy/config/customization/webui)
- [公共文件](/docs/deploy/config/customization/public-files)
- [自定义导航链接](/docs/deploy/config/customization/custom-navlinks)
- [自定义收费规则](/docs/deploy/config/customization/custom-amount-strategies)
- [自定义用户下拉菜单](/docs/deploy/config/customization/custom-userlinks)
- [自定义用户密码规则](/docs/deploy/config/customization/password-pattern)
- [自定义消费类型](/docs/deploy/config/customization/custom-charge-types)
- [消费记录中保存作业相关字段](/docs/deploy/config/customization/custom-job-charge-metadata)
- [国际化](/docs/deploy/config/customization/custom-config-i18n)
- [自定义系统语言](/docs/deploy/config/customization/custom-system-language)

# 2. 运维

- [cli常见命令](/docs/deploy/install/scow-cli#常见命令的对照)
- [运维技巧](/docs/deploy/ops/admin-usage-tips)

