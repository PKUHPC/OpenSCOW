---
sidebar_position: 2
title: 样例：Jupyter配置
---

# 样例：Jupyter配置

## 前提条件

请确保在需要运行应用的计算节点上安装有需要的软件包。

下面讲解如何配置Jupyter交互式应用。

## 配置文件

创建`config/apps`目录，在里面创建`jupyter.yml`文件，其内容如下：

```yaml title="config/apps/jupyter.yml"
```jsx
# 这个应用的ID
id: jupyter

# 这个应用的名字
name: jupyter

# 指定应用类型为web
type: web

# 指定反向代理类型
proxyType: absolute

# Web应用的配置
web:
  # 准备脚本
  beforeScript: |
    export PORT=$(get_port)
    export PASSWORD=$(get_password 12)
    export SALT=123
    export PASSWORD_SHA1="$(echo -n "${PASSWORD}${SALT}" | openssl dgst -sha1 | awk '{print $NF}')"
    export CONFIG_FILE="${PWD}/config.py"
    export SLURM_COMPUTE_NODE_IP=$(get_ip)

  # 运行任务的脚本。可以使用准备脚本定义的
  script: |
    (
    umask 077
    cat > "${CONFIG_FILE}" << EOL
    c.NotebookApp.ip = '0.0.0.0'
    c.NotebookApp.port = ${PORT}
    c.NotebookApp.port_retries = 0
    c.NotebookApp.password = u'sha1:${SALT}:${PASSWORD_SHA1}'
    c.NotebookApp.open_browser = False
    c.NotebookApp.base_url = "/proxy/${SLURM_COMPUTE_NODE_IP}/${PORT}/"
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

增加了此文件后，运行以下命令重启job-server即可。

```bash
./compose.sh restart portal-web
```

## 配置解释

### `beforeScript`和`script`

`beforeScript`部分为准备脚本。这个脚本用来准备运行任务的环境。对于Jupyter，export以下变量的含义是：

- `PORT`：程序将会运行在的端口
- `PASSWORD`: 连接程序用的密码
- `SLURM_COMPUTE_NODE_IP`: 计算节点的IP地址
- `CONFIG_FILE`: 指定Jupyter的配置文件

准备脚本中的`export`的变量可以在`script`中使用。

`script`部分为如何启动这个应用的脚本。

`beforeScript`和`script`中可以使用以下辅助函数：

| 函数名            | 作用                   | 参数         | 返回值                  |
|----------------|----------------------|------------| ----------------------- |
| `get_port`     | 获得一个可用的TCP端口         | 无          | 一个调用时可用的TCP端口 |
| `get_password` | 生成一个包含A-Za-z0-9的随机密码 | `$1`: 密码长度 | 密码                    |
| `get_ip`       | 获得计算节点的IP地址          | 无          | 计算节点的IP地址           |

这些脚本，以及一些辅助的脚本将会被作为一个作业提交给调度系统，并最终在某个计算节点上运行。

### `connect`

`connect`部分定义如何连接到应用。系统将会给可以连接的应用创建一个用于连接应用的a标签。点击a标签之后，系统将会打开一个新标签页，打开新标签页时实际进行的动作将可以在这里自定义。

配置如下：

| 属性       | 类型                 | 是否必填 | 解释                                          |
| ---------- | -------------------- | -------- | --------------------------------------------- |
| `path`     | 字符串               | 是       | 新标签页所访问的相对路径                      |
| `method`   | "GET" 或者 "POST"    | 是       | 发起一个什么的HTTP请求                        |
| `query`    | 字符串到字符串的字典 | 否       | 连接时附带的query                             |
| `formData` | 字符串到字符串的字典 | 否       | 如果`method`是POST，这个请求将会带的form data |


我们推荐将应用使用密码方式进行加密，所以一般在连接时需要将密码输入给应用。`path`, `query`的值和`formData`的值部分可以使用`{{ PASSWORD }}`代替应用在创建时生成的密码。



