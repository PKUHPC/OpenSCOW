---
sidebar_position: 2
title: 自定义前端项目主题
---

# 自定义前端项目主题

[portal-web](../../portal/deployment/web.mdx)和[mis-web](../../mis/deployment/web.md)支持自定义前端项目的主题。

## 自定义LOGO

系统支持根据不同的域名显示不同的LOGO。

创建目录`config/icons/{域名，不包括端口}`，里面将favicon存放为favicon.ico（必须有），192\*192和512\*512的大小图片存放为192.png和512.png（可选），重启portal-web和mis-web即可。

## 自定义主题色

系统支持根据不同的域名显示不同的主题色。

portal-web和mis-web都支持`DEFAULT_PRIMARY_COLOR`和`PRIMARY_COLORS`的设置，请参考配置介绍进行配置。

- [portal-web](../../portal/refs/portal-web.md)
- [mis-web](../../mis/refs/mis-web.md)




