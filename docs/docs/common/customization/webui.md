---
sidebar_position: 2
title: 自定义前端项目主题
---

# 自定义网页UI元素

系统中支持自定义一些网页中的UI元素。支持自定义UI元素的组件有：

## 自定义LOGO

系统支持根据不同的域名显示不同的LOGO。对portal-web和mis-web有效。

创建目录`config/icons/{域名，不包括端口}`，里面将favicon存放为favicon.ico（必须有），192\*192和512\*512的大小图片存放为192.png和512.png（可选），重启portal-web和mis-web即可。

## 自定义主题色和footer文本

系统支持根据不同的域名显示不同的主题色以及footer文本。

请创建文件`config/ui.yaml`，并根据以下配置说明编写自己的配置

```yaml title="config/ui.yaml"
# footer部分的配置。可以不填。
# 对portal-web、mis-web和auth的登录界面有效
footer:
    # 对所有域名生效的footer文本，默认为空字符串
    defaultText: ""
    # 对具体hostname生效的footer文本，可以不填
    hostnameTextMap: 
        # 从a.com的访问显示footer文本为a.com的文本
        a.com: a.com的文本

# 主题色配置。可以不填
# 对portal-web和mis-web有效
primaryColor:
    # 对所有域名生效的主题色。默认为#9B0000
    defaultColor: string
    # 对具体hostname生效的生效，可以不填
    hostnameTextMap: 
        # 从a.com的访问的主题色为#000000
        a.com: #000000
```




