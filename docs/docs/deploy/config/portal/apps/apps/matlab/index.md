---
sidebar_position: 1
---

# Matlab

## 软件简介

MATLAB是一种由MathWorks公司开发的专业数学软件，它可以用于数值计算、数据分析、科学绘图、机器学习、人工智能等领域。MATLAB拥有强大的矩阵运算和向量化计算能力，支持多种数据类型和格式的处理。

## 前提条件

请确保在需要运行桌面类应用的机器上安装有：

- TurboVNC 3.0版本及以上

- 您需要运行的Matlab

下面讲解如何配置使用Matlab。

## 配置文件

创建`config/apps`目录，在里面创建`matlab.yml`文件，其内容如下：

```yaml title="config/apps/matlab.yml"
# 这个应用的ID
id: matlab

# 这个应用的名字
name: matlab

# 指定应用类型为vnc
type: vnc

# VNC应用的配置
vnc:
  # 此X Session的xstartup脚本
  xstartup: |
    module load matlab/$matlab_path
    matlab -desktop
      
# 配置HTML表单
attributes:
  - type: select
    name: matlab_path
    label: 选择版本
    select:
      - value: R2019b
        label: R2019b
      - value: R2021a
        label: R2021a
      - value: R2021b
        label: R2021b
      - value: R2022b
        label: R2022b
  - type: text
    name: sbatchOptions
    label: 其他sbatch参数
    required: false
    placeholder: "比如：--gpus gres:2 --time 10"
```
