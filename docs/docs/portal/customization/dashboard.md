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

系统支持根据不同的域名显示不同的标题文本和描述信息。请参考[配置介绍](../refs/portal-web.md)配置`HOME_TEXTS`, `DEFAULT_HOME_TEXT`, `HOME_TITLES`和`DEFAULT_HOME_TITLE`环境变量。
