export HOST=$(hostname)

# Write host info
echo -e "$HOST" >VNC_SESSION_INFO

$VNCSERVER_PATH -securitytypes OTP -otp -fg -xstartup ./xstartup
