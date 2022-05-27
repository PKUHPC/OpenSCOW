FROM centos:8

WORKDIR /ldap
COPY scripts/ldap/provider.sh .

RUN ./provider.sh docker

VOLUME [ "/var/lib/ldap" ]

CMD ["slapd" ,"-u", "ldap", "-h", "ldap:/// ldapi:///", "-d", "0"]
