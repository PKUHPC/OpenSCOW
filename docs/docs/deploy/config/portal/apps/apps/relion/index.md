---
sidebar_position: 1
---

# Relion

## 软件简介

RELION（Reconstruction of 3D structures of Large macromolecular complexes using Image-based ONline reconstruction）是一种用于处理单粒子冷冻电镜（Single Particle Cryo-EM）图像数据的软件包。

## 前提条件

请确保在需要运行桌面类应用的机器上安装有：

- TurboVNC 3.0版本及以上

- 您需要运行的Relion

下面讲解如何配置使用Relion。

## 配置文件

创建`config/apps`目录，在里面创建`relion.yml`文件，其内容如下：

```yaml title="config/apps/relion.yml"
# 这个应用的ID
id: relion

# 这个应用的名字
name: relion

# 指定应用类型为vnc
type: vnc

# VNC应用的配置
vnc:
  # 此X Session的xstartup脚本
  xstartup: |
    module load ${relion_version}
    relion
      
# 配置HTML表单
attributes:
  - type: select
    name: relion_version
    label: 选择版本
    required: true
    placeholder: 选择relion的版本
    select:
      - value: relion/3.1.3_openmpi_3.1.6
        label: relion/3.1.3_openmpi_3.1.6
      - value: relion/4.0_openmpi_3.1.6
        label: relion/4.0_openmpi_3.1.6
  - type: text
    name: sbatchOptions
    label: 其他sbatch参数
    required: false
    placeholder: "比如：--gpus gres:2 --time 10"
```
