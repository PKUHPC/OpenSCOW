---
sidebar_position: 6
---

# JupyterLab

## 软件简介

JupyterLab是Jupyter Notebook的下一代版本，提供了更强大的用户界面和功能，可用于更复杂的工作流程和项目。

## 前提条件

请确保在需要运行应用的计算节点上安装有JupyterLab。

### 1、软件介绍

JupyterLab是Jupyter Notebook的下一代版本，提供了更强大的用户界面和功能，可用于更复杂的工作流程和项目。

JupyterLab建议通过[Anaconda进行安装](./jupyter.md)，Anaconda集成了JupyterLab，安装上Anaconda发行版后也就自动安装上了JupyterLab，安装好Anaconda后如果JupyterLab没有自动安装成功的话，在终端输入以下命令进行安装：

```bash
conda install jupyterlab
```

JupyterLab运行时依赖的Python环境，建议用户可自行使用conda创建所需的Python环境，并在该环境内安装ipykernel，环境创建好后，用户可以通过两种方式来使用：

- 在启动JupyterLab应用时，用户可填入所创建的conda环境名来使用该Python环境；

- 在JupyterLab启动后，在Kernel菜单切换到新创建的Python环境。

以下示例创建一个Python3.7的虚拟环境：

```bash
# 创建一个Python版本为3.7的conda虚拟环境，环境名字为python3.7
conda create -n python3.7 python=3.7 -y
# 激活进入到python3.7环境
conda activate python3.7
# 在新的环境安装ipykernel
conda install ipykernel
# 将新环境的ipykernel到base环境的jupyter中
python -m ipykernel install --user --name python3.7 --display-name "python3.7"
```

下面讲解如何配置使用JupyterLab。

## 配置文件

创建`config/apps`目录，在里面创建`jupyterlab.yml`文件，其内容如下：

```yaml title="config/apps/jupyterlab.yml"
# 这个应用的ID
id: jupyterlab

# 这个应用的名字
name: jupyterlab

# 指定应用类型为web
type: web

# Web应用的配置
web:
  # 指定反向代理类型
  proxyType: absolute
  # 准备脚本
  beforeScript: |
    export PORT=$(get_port)
    export PASSWORD=$(get_password 12)
    export SALT=123
    export PASSWORD_SHA1="$(echo -n "${PASSWORD}${SALT}" | openssl dgst -sha1 | awk '{print $NF}')"
    export CONFIG_FILE="${PWD}/config.py"
    export SLURM_COMPUTE_NODE_IP=$(get_ip)
    export SHELL_NAME=$(echo ${SHELL} | awk -F'/' '{print $NF}')
    export CONDA_VERSION="anaconda/3-2023.03"

  # 运行任务的脚本。可以使用准备脚本定义的变量
  script: |

    # 加载需要的module环境
    for m in ${textModuleName}; do module switch ${m}; done

    conda -V &> /dev/null
    if [ $? -ne 0 ]; then
      module switch ${CONDA_VERSION}
    fi
    # init conda
    eval "$($(which conda) shell.${SHELL_NAME} hook)"

    if [[ "" == "${textCondaName}" ]]; then
      textCondaName="base"
    fi
    conda activate ${textCondaName}
    if [ $? -ne 0 ]; then
      exit 1
    fi

    (
    umask 077
    cat > "${CONFIG_FILE}" << EOL
    c.NotebookApp.ip = '0.0.0.0'
    c.NotebookApp.port = ${PORT}
    c.NotebookApp.port_retries = 0
    c.NotebookApp.password = u'sha1:${SALT}:${PASSWORD_SHA1}'
    c.NotebookApp.open_browser = False
    c.NotebookApp.base_url = "${PROXY_BASE_PATH}/${SLURM_COMPUTE_NODE_IP}/${PORT}/"
    c.NotebookApp.allow_origin = '*'
    c.NotebookApp.disable_check_xsrf = True
    EOL
    )
    cd ~
    jupyter-lab --config=${CONFIG_FILE} --notebook-dir=${HOME}

  # 如何连接应用
  connect:
    method: POST
    path: /login
    formData:
      password: "{{ PASSWORD }}"

# 配置HTML表单
attributes:
  - type: text
    name: textModuleName
    label: Modules
    required: false  # 输入需要额外加载的环境模块列表
    placeholder: 输入需要额外加载的环境模块列表，模块之间用空格分开（比如：python/2.7.5 code-server/4.9.1）  # 提示信息
  - type: text
    name: textCondaName
    label: conda环境
    required: false  # 输入运行Jupyter的conda环境，默认使用base环境
    placeholder: 输入conda虚拟环境名称  # 提示信息
  - type: text
    name: sbatchOptions
    label: 其他sbatch参数
    required: false
    placeholder: "比如：--gpus gres:2 --time 10"
```

增加了此文件后，刷新WEB浏览器即可。

对于JupyterLab，export以下变量的含义是：

- `SLURM_COMPUTE_NODE_IP`: 计算节点的IP地址

- `CONFIG_FILE`: 指定JupyterLab的配置文件

- `SHELL_NAME`：当前会话的shell名称

- `CONDA_VERSION`：系统默认的conda版本
