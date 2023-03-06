#!/bin/sh

groupadd -g 1109 slurm
useradd -m -c "Slurm manager" -d /var/lib/slurm -u 1109 -g slurm -s /bin/bash slurm


cp -r /vagrant/slurm/*.conf /etc/slurm/ 
chmod 600 /etc/slurm/slurmdbd.conf
chown slurm: /etc/slurm/slurmdbd.conf

mkdir /var/spool/slurm
chown slurm: /var/spool/slurm
mkdir /var/log/slurm
chown slurm: /var/log/slurm

mkdir /var/spool/slurmctld
chown slurm: /var/spool/slurmctld

systemctl start slurmdbd
systemctl enable slurmdbd
systemctl status slurmdbd

systemctl start slurmctld
systemctl enable slurmctld
systemctl status slurmctld

# 所有节点
systemctl start slurmd
systemctl enable slurmd
systemctl status slurmd


systemctl restart slurmctld
systemctl status slurmctld

sleep 5s
sacctmgr -i create qos name=low
sacctmgr -i create qos name=high

# 设置slurm数据root密码
mysqladmin -u root password "123456"
# 设置slurm数据库远程权限
mysql -uroot -p123456 -e "grant all on slurm_acct_db.* TO 'slurm'@'%' identified by '123456' with grant option;"