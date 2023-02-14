---
sidebar_position: 1
title: 自定义仪表盘
---

# 自定义仪表盘

您可以自定义门户项目仪表盘的LOGO和文本。

## 自定义仪表盘LOGO

LOGO图片的文件名应为`banner`，后缀应为`svg`, `png`或者`jpg`后缀名，如果多个后缀名的文件同时存在，则顺序为`svg`, `png`, `jpg`。

有的图片在暗色主题下显示背景不佳，系统支持单独设置在**暗色模式下显示的LOGO图片**。在暗色模式下显示的LOGO图片的文件名应该为`banner.dark`，后缀名规则和上述规则相同。如果不存在暗色模式下的图片，则系统将显示正常模式下的LOGO图片。

将LOGO图片放入`config/logo`下即可。

系统支持根据不同的来访域名显示不同的LOGO。将需要在某个域名下显示的LOGO文件放到`config/logo/{域名}`下即可。`config/logo`下的文件为对所有其他域名的LOGO图片。判断来访域名的规则请参考[这里](../../customization/webui.md#来访的域名)。

如果您使用`svg`图片，那么自定义仪表盘LOGO将会默认占据整个页面的100%宽度，高度跟随宽度自动缩放。您可以给您的`svg`文件的`svg`标签设置`width`属性来限制图片的最大宽度。

如果您使用`png`或者`jpg`图片，那么自定义仪表盘LOGO的最大大小为图片本身的大小，如果浏览器视口宽度小于图片的宽度，则图片将会自动缩放。

## 自定义文本

系统支持根据不同的域名显示不同的标题文本和描述信息。

在`config/portal.yaml`中可以配置自定义显示的文本。文本支持HTML的标签，将会被放在一个div中。

```yaml title="config/portal.yaml"
# 主页标题
homeTitle: 
  # 默认文本。支持HTML
  defaultText: "Super Computing on Web <strong>HTML supported</strong>"
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
