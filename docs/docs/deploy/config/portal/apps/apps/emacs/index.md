---
sidebar_position: 1
---

# Emacs

## 软件简介

Emacs是一个非常强大的文本编辑器和开发环境，它有一个强大的命令行界面和一系列图形用户界面，它支持多个操作系统，包括Unix、Linux、Windows和macOS。

## 前提条件

请确保在需要运行桌面类应用的机器上安装有：

- TurboVNC 3.0版本及以上

- 您需要运行的Emacs

### 1、TurboVNC安装

```bash
wget https://turbovnc.org/pmwiki/uploads/Downloads/TurboVNC.repo --no-check-certificate
mv TurboVNC.repo /etc/yum.repos.d
# 安装最新版本
yum install turbovnc -y
```

### 2、Emacs安装

```bash
yum install emacs -y
```

下面讲解如何配置使用Emacs。

## 配置文件

创建`config/apps`目录，在里面创建`emacs.yml`文件，其内容如下：

```yaml title="config/apps/emacs.yml"
# 这个应用的ID
id: emacs

# 这个应用的名字
name: emacs

# 指定应用类型为vnc
type: vnc

# VNC应用的配置
vnc:
  # 此X Session的xstartup脚本
  xstartup: |
    emacs -mm
      
# 配置HTML表单   
attributes:
  - type: text
    name: sbatchOptions
    label: 其他sbatch参数
    required: false
    placeholder: "比如：--gpus gres:2 --time 10"
```
