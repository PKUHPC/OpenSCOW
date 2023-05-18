---
sidebar_position: 4
---

# IGV

## 软件简介

IGV (Integrative Genomics Viewer) 是一个功能强大的基因组数据分析工具，被广泛应用于生物医学研究和生物信息学领域。它支持多种数据类型，包括基因组序列、注释、比对、变异和表达等数据。

## 前提条件

请确保在需要运行桌面类应用的机器上安装有：

- TurboVNC 3.0版本及以上

- Java 1.8 或更高版本

- 您需要运行的IGV

### 1、TurboVNC安装

```bash
wget https://turbovnc.org/pmwiki/uploads/Downloads/TurboVNC.repo --no-check-certificate
mv TurboVNC.repo /etc/yum.repos.d
# 安装最新版本
yum install turbovnc -y
```

### 2、Java安装

```bash
yum install java-1.8.0-openjdk
```

#### 3、IGV安装

```bash
# 下载软件包
wget https://data.broadinstitute.org/igv/projects/downloads/2.16/IGV_Linux_2.16.1_WithJava.zip
# 解压软件包到指定安装路径
mkdir /data/software/igv
unzip IGV_Linux_2.16.1_WithJava.zip -d /data/software/igv/
```

### 4、添加modulefile文件

配置已安装好的IGV的modulefile文件:

```bash
# ${MODULEPATH}为modulefile所在的路径
mkdir -p ${MODULEPATH}/igv
cat >> ${MODULEPATH}/igv/IGV_Linux_2.16.1 << EOF
#%Module1.0#####################################################################
##
## igv@IGV_Linux_2.16.1 modulefile
##

proc ModulesHelp { } {
    puts stderr "\tThis module defines environment variables, aliases and add PATH for igv"
    puts stderr "\tVersion IGV_Linux_2.16.1"
    InfoOut
}

set appname igv
set version IGV_Linux_2.16.1
set prefix /data/software/${appname}/${version}

module-whatis   "igv@IGV_Linux_2.16.1"

prepend-path PATH               $prefix
prepend-path LD_LIBRARY_PATH    $prefix/lib
prepend-path CLASSPATH          $prefix/lib/igv.jar
EOF
```

下面讲解如何配置使用IGV。

## 配置文件

创建`config/apps`目录，在里面创建`igv.yml`文件，其内容如下：

```yaml title="config/apps/igv.yml"
# 这个应用的ID
id: igv

# 这个应用的名字
name: igv

# 指定应用类型为vnc
type: vnc

# VNC应用的配置
vnc:
  # 此X Session的xstartup脚本
  xstartup: |
    module switch igv/${igv_path}
    igv.sh
      
# 配置HTML表单
attributes:
  - type: select
    name: igv_path
    label: 选择版本
    select:
      - value: IGV_Linux_2.16.1
        label: IGV_Linux_2.16.1
  - type: text
    name: sbatchOptions
    label: 其他sbatch参数
    required: false
    placeholder: "比如：--gpus gres:2 --time 10"
```
