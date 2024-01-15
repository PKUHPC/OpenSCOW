---
sidebar_position: 1
title: 使用自定义认证系统
---

# 使用自定义认证系统

如果系统提供的认证系统不能满足您的需求，您可以自己使用和实现一个自定义认证服务。

## 使用自定义认证服务

您自己编写的自定义认证服务应该被打包为一个docker镜像，放在您部署所在机器可以访问的地址上。

修改安装配置文件的`auth.custom`部分以使用您的自定义认证服务。

```yaml title="install.yaml"
auth:
  custom:
    # 自定义认证系统类型
    # external（使用外部系统） | image（使用自定义认证系统镜像），默认为 image
    type: image
    # 自定义外部认证系统配置
    # 如果 type 为 external 则需要配置 external 选项，否则仍然使用默认认证系统 URL
    external:
      url: http://custom-url:port

    # 容器相关配置
    image:
      # 自定义认证系统镜像名。必填
      # imageName: my-custom-auth:v1.0

      # 端口映射。可选
      # ports:
      #   - "5000:5000"

      # 更多挂载卷。可选
      # 默认添加/etc/hosts:/etc/hosts和./config:/etc/scow
      # volumes:
      #   - "./myfile:/etc/myfile"

    # 下列 image、ports、volumes 配置为老版本的配置，已过时，未来将会删除
    # 兼容老版本,image 在老版本中为字符串
    # 定义认证系统镜像名。必填
    # image: my-custom-auth:v1.0

    # 兼容老版本, 端口映射。可选
    # ports:
    #   - "5000:5000"

    # 兼容老版本, 更多挂载卷。可选
    # 默认添加/etc/hosts:/etc/hosts和./config:/etc/scow
    # volumes:
    #   - "./myfile:/etc/myfile"

    # 环境变量，可选。
    # environment:
    #   - DEBUG=log
```
