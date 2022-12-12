---
sidebar_position: 1
title: 自定义仪表盘
---

# 自定义仪表盘

您可以自定义门户项目仪表盘的LOGO和文本。

## 自定义LOGO

系统支持根据不同的域名显示不同的LOGO。

创建目录`config/logo/{域名，不包括端口}`，里面将logo存放为logo.png，重启portal-web和mis-web即可。

## 自定义文本

系统支持根据不同的域名显示不同的标题文本和描述信息。

在`config/portal.yaml`中可以配置自定义文档：

```yaml title="config/portal.yaml"
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
```
