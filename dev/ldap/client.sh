# Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
# OpenSCOW is licensed under Mulan PSL v2.
# You can use this software according to the terms and conditions of the Mulan PSL v2.
# You may obtain a copy of Mulan PSL v2 at:
#          http://license.coscl.org.cn/MulanPSL2
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
# EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
# MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
# See the Mulan PSL v2 for more details.

#!/bin/sh

### Start Configuration Part

# The host of the LDAP server
ServHost="162.105.133.247"

# The values below matches the values in the provider.sh
dn=pku
ou=hpc

### End Configuration Part

#  Install LDAP-client

#   remove openldap before install

# yum -y remove openldap-clients nss-pam-ldapd
#
# This part should be executed on both LDAP-Server and
# on all clients that should authenticate against the
# LDAP-server

#[1] Install OpenLDAP Client.
echo "Install OpenLDAP Client."
yum -y install openldap openldap-clients nss-pam-ldapd sssd sssd-ldap policycoreutils-python authconfig

# ldapserver=(LDAP server's hostname or IP address)
# ldapbasedn="dc=(your own domain name)"


# The address of ldap server
basedn="o=$dn"
binddn="cn=Manager,ou=$ou,o=$dn"

authconfig --enableldap \
--enableldapauth \
--ldapserver=$ServHost \
--ldapbasedn="$basedn" \
--enablemkhomedir \
--update

#[2] If SELinux is enabled, it needs to add a rule to allow creating home directories automatically by mkhomedir.

echo "Step 2:If SELinux is enabled, it needs to add a rule to allow creating home directories automatically by mkhomedir."

cat /dev/null >/etc/openldap/mkhomedir.te
cat >> /etc/openldap/mkhomedir.te<<EOF
# create new
module mkhomedir 1.0;

require {
        type unconfined_t;
        type oddjob_mkhomedir_exec_t;
        class file entrypoint;
}
#============= unconfined_t ==============
allow unconfined_t oddjob_mkhomedir_exec_t:file entrypoint;
EOF

echo "checkmodule!"
checkmodule -m -M -o /etc/openldap/mkhomedir.mod /etc/openldap/mkhomedir.te
semodule_package --outfile /etc/openldap/mkhomedir.pp --module /etc/openldap/mkhomedir.mod
semodule -i /etc/openldap/mkhomedir.pp


rm -rf /etc/sssd/sssd.conf
cat >>/etc/sssd/sssd.conf<<EOF
[domain/default]

autofs_provider = ldap
cache_credentials = True
ldap_search_base = $basedn
id_provider = ldap
auth_provider = ldap
chpass_provider = ldap
ldap_uri = ldap://$ServHost/
ldap_tls_reqcert = allow
ldap_tls_cacertdir = /etc/openldap/cacerts
ldap_id_use_start_tls = True
[sssd]
services = nss, pam, autofs

domains = default
[nss]
homedir_substring = /home

[pam]

[sudo]

[autofs]

[ssh]

[pac]

[ifp]
EOF

chown root:root /etc/sssd/sssd.conf
chmod 600 /etc/sssd/sssd.conf
systemctl restart sssd

authconfig --enableldaptls --enablemkhomedir --update

systemctl enable systemd-logind
systemctl start systemd-logind

systemctl enable oddjobd
systemctl start oddjobd
