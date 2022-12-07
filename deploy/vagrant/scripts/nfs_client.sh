#!/bin/sh

yum install -y nfs-utils 

showmount -e 192.168.88.101

mkdir /data

mount 192.168.88.101:/data /data -o proto=tcp -o nolock

echo "192.168.88.101:/data /data nfs rw,auto,nofail,noatime,nolock,intr,tcp,actimeo=1800 0 0" >> /etc/fstab