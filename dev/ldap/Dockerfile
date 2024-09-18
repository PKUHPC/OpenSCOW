# Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
# OpenSCOW is licensed under Mulan PSL v2.
# You can use this software according to the terms and conditions of the Mulan PSL v2.
# You may obtain a copy of Mulan PSL v2 at:
#          http://license.coscl.org.cn/MulanPSL2
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
# EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
# MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
# See the Mulan PSL v2 for more details.

FROM centos:7

WORKDIR /ldap
COPY dev/ldap/provider.sh .

# https://serverfault.com/a/1161847
RUN sed -i s/mirror.centos.org/vault.centos.org/g /etc/yum.repos.d/*.repo
RUN sed -i s/^#.*baseurl=http/baseurl=http/g /etc/yum.repos.d/*.repo
RUN sed -i s/^mirrorlist=http/#mirrorlist=http/g /etc/yum.repos.d/*.repo

RUN ulimit -n 10240;./provider.sh docker

VOLUME [ "/var/lib/ldap" ]

CMD ["slapd" ,"-u", "ldap", "-h", "ldap:/// ldapi:///", "-d", "0"]
