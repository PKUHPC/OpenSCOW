---
sidebar_position: 5
title: 配置Shell终端文件传输功能
---

# 配置Shell终端文件传输功能

Shell终端支持输入命令跳转到文件系统，进行文件的上传和下载；支持下载指定文件。

输入`sopen`命令后，会跳转到文件系统的当前目录，用户可以在图形界面进行文件上传或者下载。

输入`sdown [文件名]`，用户当前路径的该文件会被下载到本地，目前不支持输入相对路径，如果需要下载其他目录下的文件请使用`sopen`命令跳转到文件系统。如果用户输入了相对路径，会提示用户不能使用相对路径。



`sopen`和`sdown [文件名]`这两个命令仅在SCOW的Shell终端中使用有效。

该功能需要在登录节点需要修改`/etc/bashrc`，插入以下函数：

```bash
sdown () {
    if [ "$1" == "-h" ]; then
      echo "Usage: sdown [-h] [FILE]"
      echo "Downloading the specified file (only valid in SCOW)."
      return 0
    fi
    if [ $# -eq 0 ];then
      echo "Please enter the file name you want to download."
      return 0
    fi

    result=$(echo $@ | grep "/")
    if [[ "$result" != "" ]]
    then
        echo "sdown does not support relative paths. Please enter the file name."
    else
      echo  "SCOW is downloading file $@ in directory `pwd`"
      echo  "This command is only valid for SCOW web shells."
    fi

}

sopen () {
    if [ "$1" == "-h" ]; then
      echo "Usage: sopen [-h]"
      echo "Open file explorer (only valid in SCOW)."
      return 0
    fi
    echo "SCOW is opening the file system `pwd`"
    echo  "This command is only valid for SCOW web shells."
}
```
