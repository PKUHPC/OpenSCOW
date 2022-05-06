exe_name=file-server
new_exe_name=$exe_name-new
log_file=log
pid_file=pid
env_file=.env

DOWNLOAD_URL='' # TODO

function pull {
  if [ -f $pid_file ]; then
    echo "Service is running. Downloading to $new_exe_name"
    curl "$DOWNLOAD_URL" -o "$new_exe_name"
    chmod 755 $new_exe_name
  else
    echo "Downloading binary to $exe_name"
    curl "$DOWNLOAD_URL" -o "$exe_name"
    chmod 755 $exe_name
  fi
}

function up {
  export $(cat "$env_file" | xargs)

  if [ -f $new_exe_name ]; then
    echo "Restarting service with new exe"
    down
    rm $exe_name
    mv $new_exe_name $exe_name
  fi

  if [ "$2" == '-d' ]; then
    echo "Run service in the background"
    ./$exe_name &>$log_file &
    pid=$!
    echo $pid >$pid_file
  else
    echo "Run service in the foreground"
    ./$exe_name
  fi
}

function down {
  if ! [ -f $pid_file ]; then
    echo "$pid_file not exist."
    exit 1
  fi
  pid=$(cat $pid_file)
  kill $(cat $pid_file)
  echo Killed $pid
  rm $pid_file
}

function logs {
  if [ "$2" == '-f' ]; then
    tail -f $log_file
  else
    cat $log_file
  fi
}

case $1 in
"pull") pull $* ;;
"up") up $* ;;
"down") down $* ;;
"logs") logs $* ;;
*) echo "Available commands: pull, up, up -d, down, logs, logs -f" ;;
esac
