#!/bin/sh

cd "apps/$SCOW_LAUNCH_APP"

cp ../../version.json ./

npm run serve
