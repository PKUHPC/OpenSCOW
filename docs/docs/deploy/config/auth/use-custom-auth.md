---
sidebar_position: 5
title: 使用自定义认证系统
---

# 使用自定义认证系统

如果系统提供的认证系统不能满足您的需求，您可以自己使用和实现一个自定义认证服务。

## 使用自定义认证服务

您自己编写的自定义认证服务应该被打包为一个docker镜像，放在您部署所在机器可以访问的地址上。

修改scow-deployment的config.py的`AUTH`部分以使用您的自定义认证服务。

```python title="config.py"
#
# ------ 自定义认证系统 -------
# 如果使用自带认证系统，请不要修改此配置
# 默认使用自带认证系统
#
AUTH = {
  # 镜像地址。必填，只要是能访问的镜像地址即可。
  "IMAGE": "ghcr.io/pkuhpc/scow-auth:master",
 
  # 端口映射（可选）
  # "PORTS": ["80:80", "3302:3302"],
 
  # 环境变量（可选）
  # "ENV": {
  #   "KEY": "123"
  # },
 
  # 卷映射（可选）
  # 默认添加/etc/hosts:/etc/hosts和./config:/etc/scow
  # 可选添加其他映射
  # "VOLUMES": {
  #   "./test.py": "/etc/test.py"  ,
  # }
}
```
