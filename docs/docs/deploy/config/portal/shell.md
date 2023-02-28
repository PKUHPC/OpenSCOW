---
sidebar_position: 5
title: shell文件跳转功能
---

# shell文件跳转功能

shell支持输入命令跳转到文件系统，在登录节点需要修改`/etc/bashrc`

插入以下函数：

```bash
function scow-goto-file() {
    echo "scow is opening the file system `pwd`"
}
```

用户在shell中输入`scow-goto-file`，可以跳转到当前目录的文件系统，进行文件的上传和下载。
