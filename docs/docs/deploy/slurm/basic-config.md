---
sidebar_label: '基础配置'
title: 基础配置
slug: /basic-config
sidebar_position: 3
---

## 1. 所有节点

设置主机名

```Bash
hostnamectl set-hostname manage01
hostnamectl set-hostname login01
hostnamectl set-hostname compute01
hostnamectl set-hostname compute02
```

配置hosts：

```Bash
vim /etc/hosts
192.168.29.106 manage01
192.168.29.101 login01
192.168.29.102 compute01
192.168.29.103 compute02
```

关闭防火墙、selinux、dnsmasq、swap：

```SQL
systemctl disable --now firewalld 
systemctl disable --now dnsmasq
systemctl disable --now NetworkManager

setenforce 0
sed -i 's#SELINUX=permissive#SELINUX=disabled#g' /etc/sysconfig/selinux
sed -i 's#SELINUX=permissive#SELINUX=disabled#g' /etc/selinux/config
reboot
getenforce


swapoff -a && sysctl -w vm.swappiness=0
sed -ri '/^[^#]*swap/s@^@#@' /etc/fstab
```

时间同步：

```Bash
# 安装ntpdate
rpm -ivh http://mirrors.wlnmp.com/centos/wlnmp-release-centos.noarch.rpm
yum install ntpdate -y

# 同步时间。time2.aliyun.com外网，vineyard.pku.edu.cn内网
# 时间同步配置如下：
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
echo 'Asia/Shanghai' >/etc/timezone
ntpdate vineyard.pku.edu.cn

# 加入到crontab
crontab -e
*/5 * * * * /usr/sbin/ntpdate vineyard.pku.edu.cn 
```

## 2. 服务节点

到其他节点的免密登录：

```Bash
yum install sshpass -y
mkdir -p /extend/shell

#生成脚本，root123 为root用户密码
cat >>/extend/shell/fenfa_pub.sh<< EOF
#!/bin/bash
ssh-keygen -t rsa -f ~/.ssh/id_rsa -P ''
for ip in 101 102 103 
do
sshpass -proot123 ssh-copy-id -o StrictHostKeyChecking=no 192.168.29.\$ip
done
EOF

# 赋权
cd /extend/shell
chmod +x fenfa_pub.sh
# 执行脚本
 ./fenfa_pub.sh
```