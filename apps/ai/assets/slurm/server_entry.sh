#!/bin/bash

# $1: the length of password
function get_password {
  local password=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c$1)
  echo $password
}

export PORT=$1
export HOST=$2
export SVCPORT=$3
