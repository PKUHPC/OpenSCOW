#!/bin/sh
\cp -r /vagrant/scow/scow-deployment/* /root/scow/scow-deployment/
\cp -r /vagrant/scow/export-jobs/* /root/scow/export-jobs/

echo "*/10 * * * * root python3 /root/scow/export-jobs/main.py >> /root/scow/export-jobs/job_export.log 2>&1" >> /etc/crontab

rm -rf /root/.docker/config.json

cd /root/scow/scow-deployment/
echo $(pwd)
sleep 5s
./cli compose pull mis-web
./cli compose up -d
