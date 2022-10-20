cp /id_rsa.pub /home/test/.ssh/authorized_keys
cp /id_rsa.pub /root/.ssh/authorized_keys

chown -R root: /root/.ssh/
chown -R test: /home/test/.ssh/

/usr/sbin/sshd -D
