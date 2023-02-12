---
sidebar_position: 2
title: 配置门户系统
---

# 配置门户系统

本节介绍如何配置门户系统。

## 修改config.py文件

修改部署路径下的config.py文件

```python
# 确保门户系统会部署，即PORTAL不能配置为False
PORTAL = {
  # 如果门户系统将会部署在系统的根目录下，设置BASE_PATH为/。默认为/
  "BASE_PATH": "/",
  # 如果门户系统将会部署在系统的/portal下，设置BASE_PATH为/portal
  # "BASE_PATH": "/portal",
}
```

:::tip

如果想自定义系统部署的相对路径，了解`PORTAL.BASE_PATH`的含义，请参考[自定义相对路径](../customization/basepath.md)。

:::

## 编写门户服务配置

在`config/portal.yaml`文件中，根据备注修改所需要的配置

```yaml title="config/mis.yaml"
# 是否启用作业管理功能
jobManagement: true

# 登录节点桌面功能
loginDesktop:
  # 是否启用桌面功能
  enabled: true

  # 桌面
  wms: 
    # 桌面名和对应的wm值。见文档
    - name: Xfce
      wm: xfce

  # 最多启动多少个桌面节点
  maxDesktops: 3

# 是否启用交互式任务功能
apps: true

# 主页标题
homeTitle: 
  # 默认文本
  defaultText: "Super Computing on Web"
  # 从不同域名访问，显示的不同的文本
  hostnameMap: 
    a.com: "a.com's SCOW Deployment"

# 主页文本
homeText: 
  # 默认文本
  defaultText: "SCOW"
  # 从不同域名访问，显示的不同的文本
  hostnameMap: 
    a.com: "a.com's SCOW"

# 是否启用终端功能
shell: true

# 提交作业的默认工作目录。使用{{ name }}代替作业名称。相对于用户的家目录
# submitJobDefaultPwd: scow/jobs/{{ name }}

# 将保存的作业保存到什么位置。相对于用户家目录
# savedJobsDir: scow/savedJobs

# 将交互式任务的信息保存到什么位置。相对于用户的家目录
# appJobsDir: scow/appData

# TurboVNC的安装路径
# turboVNCPath: /opt/TurboVNC
```

## 更多配置

一些功能可能需要进一步的配置，请根据对应的文档完成。

- [登录节点桌面](./desktop.md)

## 启动服务

运行`./compose.sh up -d`启动门户系统。