#!/bin/sh


## 配置munge
rm -rf /usr/lib/systemd/system/rngd.service

cat >>/usr/lib/systemd/system/rngd.service <<EOF
[Unit]
Description=Hardware RNG Entropy Gatherer Daemon

[Service]
ExecStart=/sbin/rngd -f -r /dev/urandom

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl start rngd
systemctl enable rngd

systemctl status rngd


cp /vagrant/slurm/munge.key /etc/munge/

chown munge: /etc/munge/munge.key
chmod 400 /etc/munge/munge.key

systemctl start munge
systemctl enable munge

systemctl status munge

munge -n

munge -n | unmunge

remunge