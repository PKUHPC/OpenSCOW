FROM centos:7

WORKDIR /ldap
COPY scripts/ldap/provider.sh .

RUN ./provider.sh docker

CMD ["slapd" ,"-u", "ldap", "-h", "ldap:/// ldapi:///", "-d", "0"]
