---
sidebar_position: 10
title: 自定义系统语言
---

# 自定义系统语言

支持用户在`common.yml`文件中通过配置项`systemLanguage`自定义是否使用SCOW的页面国际化功能。

如果不使用页面国际化功能，则允许管理员指定系统唯一语言。

如果使用，允许管理员手动设置是否跟随系统语言的自动判断。

如果跟随系统语言自动判断，那么进入系统的初始语言来自浏览器`Cookie`中保存的语言信息，或者浏览器偏好语言。
如果不跟随系统的语言判断，则进入系统的初始语言为管理员配置的默认语言。

:::note

当管理员通过配置项systemLanguage自定义系统语言时，无论是指定系统唯一语言或者是指定页面文本国际化的默认语言，
都需要确保配置的语言为当前系统的合法语言，否则系统无法启动。

目前SCOW系统下支持的合法语言字符串为`"zh_cn"`和`"en"`。

:::

## 配置示例

```yaml title="config/common.yml"

# # 设置系统语言 可选配置 类型为对象或字符串，默认值为对象类型
# # 1.systemLanguage对象类型
systemLanguage:
#   # 可选，类型为boolean，默认为true。
#   # 如果true，则SCOW在用户未手动选择语言时，自动根据cookie, header等判断语言，如判断失败使用default语言
#   # 如果为false，则SCOW首次进入系统时使用下方配置的default语言
  autoDetect: true
#   # 默认语言，当systemLanguage为对象类型时必须设置。
#   # 类型必须为当前系统合法语言["zh_cn"，"en"]的字符串枚举值
#   # 若没有配置systemLanguage，则默认为"zh_cn"
  default: "zh_cn"

# 2.systemLanguage字符串类型
# 若systemLanguage配置为字符串，类型必须指定为当前系统合法语言["zh_cn"，"en"]的字符串枚举值
# SCOW直接使用此语言，不允许用户再进行语言切换
# systemLanguage: "zh_cn"

```

## 配置结果示例

1.如果没有配置`systemLanguage`，则等同于下方类似配置。

```yaml title="config/common.yml"

systemLanguage:
  autoDetect: true 
  default: "zh_cn"

```

或者

```yaml title="config/common.yml"

systemLanguage:
  default: "zh_cn"

```

其含义为使用系统的页面国际化功能，允许用户在使用时手动切换语言。
初始语言跟随系统判断，即优先从浏览器`Cookie`中保存的语言信息，或者浏览器偏好语言中选择语言。如果上述二者均不符合SCOW系统支持的合法语言，那么初始语言为配置的`default: "zh_cn"`。

![国际化系统语言配置示例](images/system-language-i18n.png)

2.如果`autoDetect`配置为`false`。

```yaml title="config/common.yml"

systemLanguage:
  autoDetect: false
  default: "zh_cn"

```

其含义为使用系统的页面国际化功能，允许用户在使用时手动切换语言。初始语言不跟随系统判断。
即不考虑浏览器`Cookie`中保存的语言信息和浏览器偏好语言，每次进入SCOW系统时默认初始语言均为配置的`default: "zh_cn"`。

3.如果不使用国际化功能。则需满足下列类似配置。

```yaml title="config/common.yml"

systemLanguage: "zh_cn"

```

其含义为指定系统唯一语言为简体中文。页面不再展示语言选择框。不再允许用户在使用SCOW时进行语言切换。

![指定唯一语言配置示例](images/system-language-zh_cn.png)
