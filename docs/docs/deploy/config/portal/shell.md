---
sidebar_position: 5
title: 配置Shell终端文件传输功能
---

# 配置Shell终端文件传输功能

Shell终端支持输入命令跳转到文件系统，进行文件的上传和下载。

通过`sdown`命令进行文件的下载，如果用户在SCOW的Shell终端中输入`sdown 文件名`，用户当前路径的该文件会被下载到本地；如果`sdown`命令后不加文件名，会直接在文件系统中打开当前的目录，用户可以在图形界面选择文件进行下载。

通过`sup`命令进行文件的上传，用户输入该命令后，SCOW会在文件系统中打开当前的目录，用户可以进行文件的上传。

该功能需要在登录节点需要修改`/etc/bashrc`，插入以下函数：

```bash
sdown () {
    if [ "$1" == "-h" ]; then
      echo "Usage: sdown [-h] [FILE]"
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

sup () {
    if [ "$1" == "-h" ]; then
      echo "Usage: sup [-h]"
      echo "Open file explorer (only valid in SCOW)."
      return 0
    fi
    echo "SCOW is opening the file system `pwd`"
    echo  "This command is only valid for SCOW web shells."
}
```
