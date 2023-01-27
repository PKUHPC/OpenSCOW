#!/bin/sh
cd /root/scow/ && git clone https://github.com/PKUHPC/scow-deployment.git --depth=1 
# cd /root/scow/ && git clone https://gitee.com/pku_icode/scow-deployment.git --depth=1

cd /root/scow/ && git clone https://github.com/PKUHPC/export-jobs.git --depth=1
# cd /root/scow/ && git clone https://gitee.com/pku_icode/export-jobs.git --depth=1

cp -r /root/scow/scow-deployment/config-example /root/scow/scow-deployment/config

\cp -r /vagrant/scow/scow-deployment/* /root/scow/scow-deployment/
\cp -r /vagrant/scow/export-jobs/* /root/scow/export-jobs/

echo "*/10 * * * * root python3 /root/scow/export-jobs/main.py >> /root/scow/export-jobs/job_export.log 2>&1" >> /etc/crontab


chmod 777 /root/scow/scow-deployment/compose.sh

cd /root/scow/scow-deployment/
echo $(pwd)
sleep 5s
./compose.sh up -d
