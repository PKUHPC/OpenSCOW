---
sidebar_position: 1
title: UI扩展
---

# UI扩展

如果您需要在SCOW的界面中增加更多的页面，您可以开发自己的UI，并通过**UI扩展**功能将您的UI集成进SCOW的UI中。这样，您的用户在访问您自己的页面时，也可以获得与访问SCOW的功能一致的体验。

下图为一个UI扩展演示。演示中的UI扩展增加了一个顶级导航项，并在下面增加了两个二级导航项。

- 第一个二级导航项显示了一个登录界面，其获取了SCOW的登录用户的token，并与SCOW的国际化和黑暗模式相同步。此导航项的图标也是由UI扩展自己提供。
- 第二个二级导航项是一个至[GitHub](http://github.com)的链接

![UI扩展演示](./extension.gif)

## 开发UI扩展

请参考[开发UI扩展](./develop.md)。

## 配置SCOW使用UI扩展

当您的扩展站开发并部署完成后，请在`config/portal.yaml`和/或`config/mis.yaml`中增加以下内容，以开启SCOW UI扩展。

```yaml title="config/{portal,mis}.yaml"
uiExtension:
  # 您的UI扩展页部署URL
  url: http://localhost:16566/basepath
```
