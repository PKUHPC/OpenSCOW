#!/bin/sh

# 此处需要执行权限
mkdir /data
chmod 755 /data

echo "/data *(rw,sync,insecure,no_subtree_check,no_root_squash)" > /etc/exports

systemctl start rpcbind 
systemctl start nfs-server

systemctl enable rpcbind 
systemctl enable nfs-server

showmount -e localhost

# 创建home目录作为用户家目录的集合，可自定义
mkdir /data/home

# 创建software目录作为交互式应用的安装目录
mkdir /data/software
 

tar -xf /root/code-server-4.7.1-linux-amd64.tar.gz -C /data/software
mv /data/software/code-server-4.7.1-linux-amd64 /data/software/code-server

# 静默安装 Anaconda
bash /root/Anaconda3-2023.03-Linux-x86_64.sh -b -p /data/software/anaconda