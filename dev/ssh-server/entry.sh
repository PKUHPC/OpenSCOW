# Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
# SCOW is licensed under Mulan PSL v2.
# You can use this software according to the terms and conditions of the Mulan PSL v2.
# You may obtain a copy of Mulan PSL v2 at:
#          http://license.coscl.org.cn/MulanPSL2
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
# EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
# MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
# See the Mulan PSL v2 for more details.

if [ -f /id_rsa.pub ]; then
  cp /id_rsa.pub /home/test/.ssh/authorized_keys
  cp /id_rsa.pub /root/.ssh/authorized_keys

  chown -R root: /root/.ssh/
  chown -R test: /home/test/.ssh/
fi


if [ -n "$SSH_PORT" ]; then
  echo -e "Port $SSH_PORT\n" >>/etc/ssh/sshd_config
fi

/usr/sbin/sshd -D
