#!/bin/bash

sed -i -e '$aPubkeyAcceptedKeyTypes=+ssh-rsa\n' /etc/ssh/sshd_config
