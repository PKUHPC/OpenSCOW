# Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
# SCOW is licensed under Mulan PSL v2.
# You can use this software according to the terms and conditions of the Mulan PSL v2.
# You may obtain a copy of Mulan PSL v2 at:
#          http://license.coscl.org.cn/MulanPSL2
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
# EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
# MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
# See the Mulan PSL v2 for more details.

FROM alpine:3.17

ENV TZ Asia/Shanghai

RUN apk add --no-cache openssh=9.1_p1-r1 sudo

COPY ./entry.sh /entry.sh

RUN ssh-keygen -A ; mkdir /root/.ssh

RUN echo "PermitRootLogin yes" >> /etc/ssh/sshd_config; sed -i -e '$aPubkeyAcceptedKeyTypes=+ssh-rsa\n' /etc/ssh/sshd_config

RUN adduser -D test;echo "test:1234" | chpasswd ; mkdir /home/test/.ssh/ ; chown test.test home/test/.ssh/

CMD ["sh", "/entry.sh"]
