FROM centos:7

WORKDIR /ldap
COPY dev/ldap/provider.sh .

RUN ulimit -n 10240;./provider.sh docker

VOLUME [ "/var/lib/ldap" ]

CMD ["slapd" ,"-u", "ldap", "-h", "ldap:/// ldapi:///", "-d", "0"]
