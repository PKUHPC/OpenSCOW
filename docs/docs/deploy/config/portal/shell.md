---
sidebar_position: 5
title: shell文件跳转功能
---

# shell文件跳转功能

shell支持输入命令跳转到文件系统，在登录节点需要修改`/etc/bashrc`

插入以下函数：

```bash

scowdownload () {
    if [ "$1" == "-h" ]; then
      echo "Usage: scowdownload [-h] [FILE]"
      echo "Downloading the specified file, or open file explorer (only valid in SCOW)."
      return 0
    fi
    if [ $# -eq 0 ];then
      echo "SCOW is opening the file system `pwd`"
      echo  "This command is only valid for SCOW web shells."
      return 0
    fi
    echo  "SCOW is downloading file $@ in directory `pwd`"
    echo  "This command is only valid for SCOW web shells."
}

scowupload () {
    if [ "$1" == "-h" ]; then
      echo "Usage: scowupload [-h]"
      echo "Open file explorer (only valid in SCOW)."
      return 0
    fi
    echo "SCOW is opening the file system `pwd`"
    echo  "This command is only valid for SCOW web shells."
}
```

用户在SCOW的shell中输入`scowdownload` 或者 `scowupload`命令，可以跳转到当前目录的文件系统，进行文件的上传和下载。如果`scowdownload`命令后面有文件名，会直接下载该文件。
