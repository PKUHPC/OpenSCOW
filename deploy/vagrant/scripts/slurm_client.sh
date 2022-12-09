#!/bin/sh

groupadd -g 1109 slurm
useradd -m -c "Slurm manager" -d /var/lib/slurm -u 1109 -g slurm -s /bin/bash slurm


cp -r /vagrant/slurm/*.conf /etc/slurm/ 

mkdir /var/spool/slurm
chown slurm: /var/spool/slurm
mkdir /var/log/slurm
chown slurm: /var/log/slurm


# 所有节点
systemctl start slurmd
systemctl enable slurmd
systemctl status slurmd

