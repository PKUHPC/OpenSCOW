---
sidebar_position: 1
---

# Octave

## 软件简介

Octave是一种开源的数值计算工具，可用于执行各种数值计算任务，包括线性代数、非线性优化、信号处理、图像处理和统计分析等。

## 前提条件

请确保在需要运行桌面类应用的机器上安装有：

- TurboVNC 3.0版本及以上

- 您需要运行的Octave

### 1、TurboVNC安装

```bash
wget https://turbovnc.org/pmwiki/uploads/Downloads/TurboVNC.repo --no-check-certificate
mv TurboVNC.repo /etc/yum.repos.d
# 安装最新版本
yum install turbovnc -y
```

### 2、Octave安装

- octave可以通过conda进行安装，请参考Jupyter应用配置附章中的[Anaconda安装](../jupyter/index.md)。

- 创建一个新的conda环境，新环境名称格式使用“软件名-版本号”：

    ```bash
    conda create -n octave-7.2.0 -y
    ```

- 激活新创建的环境：

    ```bash
    conda activate octave-7.2.0
    ```

- 安装 Octave：

    ```bash
    conda install octave=7.2.0
    ```

下面讲解如何配置使用Octave。

## 配置文件

创建`config/apps`目录，在里面创建`octave.yml`文件，其内容如下：

```yaml title="config/apps/octave.yml"
# 这个应用的ID
id: octave

# 这个应用的名字
name: octave

# 指定应用类型为vnc
type: vnc

# VNC应用的配置
vnc:
  # 准备脚本
  beforeScript: |
    export CONDA_VERSION="anaconda/3-2023.03"
    export SHELL_NAME=$(echo ${SHELL} | awk -F'/' '{print $NF}')

  # 此X Session的xstartup脚本
  xstartup: |
    module switch ${CONDA_VERSION}
    eval "$($(which conda) shell.${SHELL_NAME} hook)"

    conda activate ${octave_version}
    if [ $? -ne 0 ]; then
      exit 1
    fi
    octave --gui
      
# 配置HTML表单
attributes:
  - type: select
    name: octave_version
    label: 选择版本
    select:
      - value: octave-7.2.0
        label: octave-7.2.0
  - type: text
    name: sbatchOptions
    label: 其他sbatch参数
    required: false
    placeholder: "比如：--gpus gres:2 --time 10"
```

增加了此文件后，刷新WEB浏览器即可。

对于Octave，export以下变量的含义是：

- `SHELL_NAME`：当前会话的shell名称

- `CONDA_VERSION`：系统默认的conda版本
