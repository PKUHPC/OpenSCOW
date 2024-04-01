export PORT=$1
export HOST=$2
export SVCPORT=$3


$VNCSERVER_BIN_PATH -securitytypes OTP -otp -fg -xstartup ./xstartup -log ./vnc.log
