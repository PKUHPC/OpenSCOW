---
sidebar_position: 1
---

# JupyterLab

## 软件简介

JupyterLab是Jupyter Notebook的下一代版本，提供了更强大的用户界面和功能，可用于更复杂的工作流程和项目。

## 前提条件

请确保在需要运行应用的计算节点有JupyterLab镜像或者可以拉取到配置里对应的镜像地址。

### 1、软件介绍

JupyterLab是Jupyter Notebook的下一代版本，提供了更强大的用户界面和功能，可用于更复杂的工作流程和项目。

下面讲解如何配置使用JupyterLab。

## 配置文件

创建`config/ai/apps`目录，在里面创建`jupyter.yml`文件，其内容如下：

```yaml title="config/ai/apps/jupyter.yml"
# 这个应用的ID
id: jupyter

# 这个应用的名字
name: jupyter

image:
  # 镜像名称
  name: jupyter/minimal-notebook
  # 镜像版本
  tag: latest

# 指定应用类型为web
type: web

# Web应用的配置
web:
  # 指定反向代理类型
  proxyType: absolute
  # 准备脚本
  beforeScript: |
    export PASSWORD=$(get_password 12)
    export SALT=123
    export PASSWORD_SHA1="$(echo -n "${PASSWORD}${SALT}" | openssl dgst -sha1 | awk '{print $NF}')"
  
  # 指明运行任务的脚本中的启动命令，用户在创建应用页面可以在脚本中替换该命令
  startCommand:
    jupyter-lab

  # 运行任务的脚本。可以使用准备脚本定义的变量
  script: |
    jupyter-lab --ServerApp.ip='0.0.0.0' --ServerApp.port=${PORT} --ServerApp.port_retries=0 --ServerApp.password="sha1:${SALT}:${PASSWORD_SHA1}" --ServerApp.open_browser=False --ServerApp.base_url="${PROXY_BASE_PATH}/${HOST}/${SVCPORT}/" --ServerApp.allow_origin='*' --ServerApp.disable_check_xsrf=True --ServerApp.root_dir="${workingDir}" --allow-root

  # 如何连接应用
  connect:
    method: POST
    path: /login
    formData:
      password: "{{ PASSWORD }}"

# 配置HTML表单
attributes:
  - type: text
    name: workingDir
    label: 指定jupyter工作目录
    required: true
    placeholder: "请填写绝对路径"
```

增加了此文件后，刷新WEB浏览器即可。
