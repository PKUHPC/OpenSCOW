---
sidebar_position: 2
title: 配置桌面类应用
---

# 配置桌面类应用 

## 前提条件

请确保在需要运行桌面类应用的机器上安装有：

- [TurboVNC](https://turbovnc.org/) 3.0版本及以上
- 您需要运行的桌面类应用

## 配置示例

下面以使用emacs为示例介绍如何配置桌面类应用。

创建`config/apps`目录，在里面创建`emacs.yml`文件，其内容如下：

```yaml title="config/apps/emacs.yml"
# 这个应用的ID
id: emacs

# 这个应用的名字
name: emacs

# 指定应用类型为vnc
type: vnc

# slurm配置
slurm:
  options:
     - "-X node[1-2]"

# VNC应用的配置
vnc: 

  # 此X Session的xstartup脚本
  xstartup: |
    emacs -mm

```

增加了此文件后，运行以下命令重启job-server即可。

```bash
docker compose restart portal-web
```

## 配置解释

### xstartup

对于桌面类应用，系统提交一个计算任务。此任务将会在计算节点上启动一个TurboVNC实例，此TurboVNC实例将会以配置中的`xstartup`脚本作为其启动脚本。

所以对于桌面类应用而言，您只需要填写正确的xstartup脚本即可。

