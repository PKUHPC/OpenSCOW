---
sidebar_position: 4
title: vagrant镜像制作
---



## 1. login/compute节点镜像制作

基于vagrant官方centos/7镜像(7.8.2003)，执行的命令如下：

```Bash
# 1. 升级到centos7.9.2009
yum update -y 

# 2. 关闭firewalld、dnsmasq、NetworkManager
systemctl disable --now firewalld 
systemctl disable --now dnsmasq
systemctl disable --now NetworkManager

# 3. 关闭selinux
setenforce 0
sed -i 's#SELINUX=enforcing#SELINUX=disabled#g' /etc/sysconfig/selinux
sed -i 's#SELINUX=enforcing#SELINUX=disabled#g' /etc/selinux/config
getenforce

# 4. 关闭swap
swapoff -a && sysctl -w vm.swappiness=0enforcing
sed -ri '/^[^#]*swap/s@^@#@' /etc/fstab


# 5. 时间同步
rpm -ivh http://mirrors.wlnmp.com/centos/wlnmp-release-centos.noarch.rpm
yum install ntpdate vim -y

# 同步时间。time2.aliyun.com外网，vineyard.pku.edu.cn内网
# 时间同步配置如下：
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
echo 'Asia/Shanghai' >/etc/timezone
ntpdate time2.aliyun.com

cat >>/var/spool/cron/root <<EOF
*/5 * * * * /usr/sbin/ntpdate time2.aliyun.com
EOF

# 6. 安装epel-release
yum install epel-release -y

# 7. 安装emacs wget
yum install emacs wget -y

# 8. 安装turbovnc
wget https://turbovnc.org/pmwiki/uploads/Downloads/TurboVNC.repo --no-check-certificate
mv TurboVNC.repo /etc/yum.repos.d
# 安装最新版本
yum install turbovnc -y

# 9. 安装桌面
yum groupinstall "Xfce" -y
yum groupinstall "KDE Plasma Workspaces" -y
yum groupinstall "MATE Desktop" -y
yum install cinnamon -y

# 10. 安装rng-tools
yum install -y rng-tools
rngd -r /dev/urandom

# 11. 安装munge
yum install munge munge-libs munge-devel -y

# 12. 安装slurm
yum install gcc gcc-c++ readline-devel perl-ls-MakeMaker pam-devel rpm-build mysql-devel python3 -y
# 此处是拷贝的slurm的编译文件
cp -r /vagrant/slurm/rpmbuild/ /root/ 
cd /root/rpmbuild/RPMS/x86_64/ && yum localinstall slurm-* -y

# 13. 支持密码登录登录
sed -i 's#PasswordAuthentication no#PasswordAuthentication yes#g' /etc/ssh/sshd_config
systemctl restart sshd
```

此处slurm的编译请参见文档[slurm集群部署](https://pkuhpc.github.io/SCOW/docs/slurm) 中slurm编译相关内容

## 2. slurm节点镜像制作

在login/compute节点镜像的基础上，执行的命令如下：

```Bash
# 1.安装mariadb
yum -y install mariadb-server
systemctl start mariadb
systemctl enable mariadb

# 初始化
mysql << EOF
   set password=password('${db_passwd}');
   create database slurm_acct_db;
   create user slurm;
   grant all on slurm_acct_db.* TO 'slurm'@'localhost' identified by '123456' with grant option;
   grant select on slurm_acct_db.* to 'slurm'@'%' identified by '123456';
   flush privileges;
EOF

# 2. 拷贝vscode文件
cp code-server-4.7.1-linux-amd64.tar.gz /root/
```

1. 此处code-server的下载地址为：https://github.com/coder/code-server/releases/download/v4.7.1/code-server-4.7.1-linux-amd64.tar.gz
2. 也可选择其他版本下载：https://github.com/coder/code-server/releases

## 3. SCOW节点镜像制作

基于vagrant官方centos/7镜像(7.8.2003)，执行如下命令：

```Bash
# 1. 升级到centos7.9.2009
yum update -y 

# 2. 关闭firewalld、dnsmasq、NetworkManager
systemctl disable --now firewalld 
systemctl disable --now dnsmasq
systemctl disable --now NetworkManager

# 3. 关闭selinux
setenforce 0
sed -i 's#SELINUX=enforcing#SELINUX=disabled#g' /etc/sysconfig/selinux
sed -i 's#SELINUX=enforcing#SELINUX=disabled#g' /etc/selinux/config
getenforce

# 4. 关闭swap
swapoff -a && sysctl -w vm.swappiness=0enforcing
sed -ri '/^[^#]*swap/s@^@#@' /etc/fstab


# 5. 时间同步
rpm -ivh http://mirrors.wlnmp.com/centos/wlnmp-release-centos.noarch.rpm
yum install ntpdate vim -y

# 同步时间。time2.aliyun.com外网，vineyard.pku.edu.cn内网
# 时间同步配置如下：
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
echo 'Asia/Shanghai' >/etc/timezone
ntpdate time2.aliyun.com

cat >>/var/spool/cron/root <<EOF
*/5 * * * * /usr/sbin/ntpdate time2.aliyun.com
EOF

# 6. 安装docker
yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2
  
# 设置稳定存储库
yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo 
    
# 安装Docker CE
yum install docker-ce -y

# 启动Docker CE并设置开机启动
systemctl start docker
systemctl enable docker


# 7. 安装docker-compose
curl -L "https://github.com/docker/compose/releases/download/v2.7.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
# 赋权
chmod +x /usr/local/bin/docker-compose

# 验证安装成功
docker-compose --version

# 8. 创建scow目录
mkdir /root/scow/

yum install -y python3
pip3 install -r /root/scow/export-jobs/requirements.txt


# 9. 支持密码登录登录
sed -i 's#PasswordAuthentication no#PasswordAuthentication yes#g' /etc/ssh/sshd_config
systemctl restart sshd
```

