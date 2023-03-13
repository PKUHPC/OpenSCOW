#!/bin/sh

cd "apps/$SCOW_LAUNCH_APP"

cp ../../version.json ./

# exec to listen for stop signal
exec npm run serve
