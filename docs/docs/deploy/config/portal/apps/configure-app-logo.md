---
sidebar_position: 6
title: 配置应用图标
---

# 配置应用图标

Web和VNC类应用都可以通过`logoPath`配置项，修改创建应用的图标。

管理员通过把存放在和`install.yml`同级的`public`目录下图片文件的路径添加到`logoPath`来进行自定义图标配置。公共文件路径的使用详见[公共文件](../../customization/public-files.md)。

管理员所添加的图片文件后缀应为常用图片文件`.svg`，`.png`或者`.jpg`等。

如将图片`app1.svg`上传到公共文件`public`目录下新建的`apps`路径下,则在配置时需填写`logoPath:"/apps/app1.svg"`。

`logoPath`可以选填，如不填写，则将统一显示系统默认图片图标。


## 配置示例

无论Web类应用还是VNC类应用，自定义图标配置方法都相同。

以[coder/code-server](https://github.com/coder/code-server)创建VSCode为例，带有自定义图标配置的配置文件如下：

```yaml title="config/apps/vscode.yml"
# 这个应用的ID
id: vscode

# 这个应用的名字
name: VSCode

# 这个应用的图标图片在公共文件下的地址
logoPath: /apps/VScode.svg

# 指定应用类型为web
type: web

# Web应用的配置
web:

  # 指定反向代理类型
  proxyType: relative

  # 准备脚本
  beforeScript: |
    export PORT=$(get_port)
    export PASSWORD=$(get_password 12)

  # 运行任务的脚本。使用了用户在自定义表单中选择的选项
  script: |
    module load ${selectVersion}
    PASSWORD=$PASSWORD code-server -vvv --bind-addr 0.0.0.0:$PORT --auth password

  # 如何连接应用
  connect:
    method: POST
    path: /login
    formData:
      password: "{{ PASSWORD }}"

# 配置HTML表单，用户可以指定code-server版本      
attributes:
  - type: select
    name: selectVersion
    label: 选择版本
    required: true  # 用户必须选择一个版本
    placeholder: 选择code-server的版本  # 提示信息
    select:
      - value: code-server/4.8.0
        label: version 4.8.0
      - value: code-server/4.9.0
        label: version 4.9.0
```

## 配置解释

`logoPath`的配置解释如下：

| 属性         | 类型                           | 是否必填 | 解释                                                                        |
|------------|---------------------------------|----------|----------------------------------------------------------------------------|
| `logoPath` | 字符串                           | 否       | 自定义应用图标的图片源地址，[公共文件](../../customization/public-files.md)下的自定义应用图片的路径。可选填，如未填写则显示系统默认图片图标。支持格式为常用图片文件格式`.svg`，`.png`或者`.jpg`等。                                                                    |
