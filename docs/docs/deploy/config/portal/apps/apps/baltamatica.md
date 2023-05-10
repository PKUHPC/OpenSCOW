---
sidebar_position: 6
---

# Baltamatica

## 前提条件

请确保在需要运行桌面类应用的机器上安装有：

- TurboVNC 3.0版本及以上

- 您需要运行的Baltamatica

### 1、软件介绍

北太天元（Baltamatica）是面向科学计算与工程计算的国产通用型科学计算软件。本软件提供科学计算、可视化、交互式程序设计，具备强大的底层数学函数库，支持数值计算、数据分析、数据可视化、 数据优化、算法开发等工作，并通过SDK与API接口，扩展支持各类学科与行业场景，为各领域科学家与工程师提供优质、可靠的科学计算环境。

### 2、TurboVNC安装

```bash
wget https://turbovnc.org/pmwiki/uploads/Downloads/TurboVNC.repo --no-check-certificate
mv TurboVNC.repo /etc/yum.repos.d
# 安装最新版本
yum install turbovnc -y
```

### 3、构建Baltamatica镜像

构建Singularity镜像需要先安装Singularity软件，具体安装步骤请参考RStudio应用配置中的[Singularity安装](./rstudio.md)。

- 创建容器并进行北太天元安装

    ```bash
    # 拉取docker镜像创建sandbox格式容器
    singularity build --sandbox balt-sing docker://ubuntu:20.04
    # 通过交互的方式进入容器镜像，进行北太天元软件的安装
    singularity shell -w balt-sing

    # 在镜像内安装一些需要用到的工具
    apt update
    apt install vim -y

    # 在镜像内安装北太天元软件，下方文件名修改为对应的安装包名
    # 安装时需要选择一些地域，选择Asia HongKong Chinese等
    apt install ./baltamatica***.deb

    #运行下述命令解决libQt5Core.so.5链接失败的问题
    apt install binutils -y
    strip --remove-section=.note.ABI-tag /opt/Baltamatica/lib/libQt5Core.so.5

    # 修改北太天元启动脚本
    vim /opt/Baltamatica/bin/baltamatica.sh
    # 修改export BALTAM_PATH=$(cd ${0%/*}/..;pwd)为export BALTAM_PATH="/opt/Baltamatica"

    # 安装完毕退出容器
    exit

    # 将容器打包
    singularity build balt-sing.sif balt-sing/
    ```

- 将Singularity镜像拷贝到共享存储，以便在计算节点可以访问并运行：

    ```bash
    cp balt-sing.sif /data/software/baltamatica/
    ```

- 下载思源黑体，解决不能正确显示中文的问题

    ```bash
    wget https://github.com/adobe-fonts/source-han-sans/releases/download/2.004R/SourceHanSansCN.zip
    unzip SourceHanSansCN.zip
    # 转存到共享存储
    mv SourceHanSansCN/CN /data/software/baltamatica/SubsetOTF
    ```

下面讲解如何配置使用Baltamatica。

## 配置文件

创建`config/apps`目录，在里面创建`baltamatica.yml`文件，其内容如下：

```yaml title="config/apps/baltamatica.yml"
# 这个应用的ID
id: baltamatica

# 这个应用的名字
name: baltamatica

# 指定应用类型为vnc
type: vnc

# VNC应用的配置
vnc:
  # 此X Session的xstartup脚本
  xstartup: |
    export SINGULARITY_VERSION="singularity/3.9.2"
    module switch ${SINGULARITY_VERSION}
    unset SESSION_MANAGER
    unset DBUS_SESSION_BUS_ADDRESS
    startxfce4 &
    mkdir ~/fonts
    cp -r /data/software/baltamatica/SubsetOTF ~/fonts
    singularity exec /data/software/baltamatica/balt-sing.sif baltamatica.sh
      
# 配置HTML表单
attributes:
  - type: text
    name: sbatchOptions
    label: 其他sbatch参数
    required: false
    placeholder: "比如：--gpus gres:2 --time 10"
```
