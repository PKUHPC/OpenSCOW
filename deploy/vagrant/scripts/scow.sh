#!/bin/sh

\cp -r /vagrant/scow/scow-deployment/config/* /root/scow/scow-deployment/config/
\cp /vagrant/scow/scow-deployment/compose.sh /root/scow/scow-deployment/
\cp -r /vagrant/scow/export-jobs/* /root/scow/export-jobs/

chmod 777 /root/scow/scow-deployment/compose.sh
chmod 777 /root/scow/scow-deployment/db.sh
cd /root/scow/scow-deployment/
echo $(pwd)
sleep 5s
./compose.sh up -d
