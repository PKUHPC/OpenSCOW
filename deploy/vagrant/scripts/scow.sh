#!/bin/sh
\cp -r /vagrant/scow/scow-deployment/* /root/scow/scow-deployment/

docker stop sourcedb && docker rm  sourcedb

rm -rf /root/scow/export-jobs/

rm -rf /root/.docker/config.json

cd /root/scow/scow-deployment/
echo $(pwd)
sleep 5s
./cli compose pull mis-web
./cli compose up -d
