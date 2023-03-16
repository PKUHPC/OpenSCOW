---
sidebar_position: 5
title: 配置Shell终端文件传输功能
---

# 配置Shell终端文件传输功能

Shell终端支持输入命令跳转到文件系统，进行文件的上传和下载；支持下载指定文件。

输入`sopen`命令后，会跳转到文件系统的当前目录，用户可以在图形界面进行文件上传或者下载。

输入`sdown [文件名]`，用户当前路径的该文件会被下载到本地，目前仅支持直接输入当前目录下的文件名，不支持相对路径，如果需要下载其他目录下的文件请使用`sopen`命令跳转到文件系统。如果用户输入了相对路径，会提示用户不能使用相对路径。

使用示例:

```bash
sdown hello.txt
```

如果当前在B目录下，需要下载A目录下的文件，有两种方式：
1. 可以进入A目录，然后`sdown [文件名]`下载
2. 也可以`sopen`进入文件系统以后，在图形界面切换到A目录选择文件进行下载。



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

    if [ $# -gt 1 ];then
      echo "Please enter only one file name. Multiple file names are not supported."
      return 0
    fi


    result=$(echo $@ | grep "/")
    if [[ "$result" != "" ]]
    then
        echo "sdown does not support relative paths. Please enter the file name."
        return 0
    fi

    if [ ! -f "$@" ]; then
      echo  "File $@ does not exist."
      return 0
    fi

    echo  "SCOW is downloading file $@ in directory `pwd`"
    echo  "This command is only valid for SCOW web shells."
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
