function get_port {
  echo $(python -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()')
}

# $1: the length of password
function get_password {
  local password=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c$1)
  echo $password
}

export HOST=$(hostname)

source before.sh

source script.sh
