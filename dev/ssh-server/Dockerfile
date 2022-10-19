FROM alpine

ENV TZ Asia/Shanghai

RUN apk add --no-cache openssh=9.0_p1-r2

COPY ./entry.sh /entry.sh

RUN ssh-keygen -A ; mkdir /root/.ssh

RUN echo "PermitRootLogin yes" >> /etc/ssh/sshd_config; sed -i -e '$aPubkeyAcceptedKeyTypes=+ssh-rsa\n' /etc/ssh/sshd_config

RUN adduser -D test;echo "test:1234" | chpasswd ; mkdir /home/test/.ssh/ ; chown test.test home/test/.ssh/

CMD ["sh", "/entry.sh"]
