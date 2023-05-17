---
sidebar_position: 2
title: Jupyter
---

# Jupyter

## 前提条件

请确保在需要运行应用的计算节点上安装有Jupyter Notebook。

下面讲解如何配置使用Jupyter。

## 配置文件

创建`config/apps`目录，在里面创建`jupyter/config.yml`文件，其内容如下：

```yaml title="config/apps/jupyter/config.yml"
# 这个应用的ID
id: jupyter

# 这个应用的名字
name: jupyter

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
    export SLURM_COMPUTE_NODE_HOSTNAME=$(hostname)

  # 运行任务的脚本。可以使用准备脚本定义的变量
  script: |
    (
    umask 077
    cat > "${CONFIG_FILE}" << EOL
    c.NotebookApp.ip = '0.0.0.0'
    c.NotebookApp.port = ${PORT}
    c.NotebookApp.port_retries = 0
    c.NotebookApp.password = u'sha1:${SALT}:${PASSWORD_SHA1}'
    c.NotebookApp.open_browser = False
    c.NotebookApp.base_url = "${PROXY_BASE_PATH}/${SLURM_COMPUTE_NODE_HOSTNAME}/${PORT}/"
    c.NotebookApp.allow_origin = '*'
    c.NotebookApp.disable_check_xsrf = True
    EOL
    )
    jupyter notebook --config=${CONFIG_FILE}

  # 如何连接应用
  connect:
    method: POST
    path: /login
    formData:
      password: "{{ PASSWORD }}"
```

增加了此文件后，刷新即可。

对于Jupyter，export以下变量的含义是：

- `SLURM_COMPUTE_NODE_IP`: 计算节点的IP地址
- `CONFIG_FILE`: 指定Jupyter的配置文件

