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

要使用UI扩展，您首先需要开发并构建一个从外界可以访问的网站（称为**扩展站**）。您可以使用任何技术开发、维护和部署此网站，只需要满足您的用户可以通过直接公网访问即可。

### 扩展页

当用户访问SCOW部署路径的`/extensions/*`的路径时，SCOW将会显示SCOW的基础导航结构，并在主要内容部分通过一个`iframe`显示您的**扩展站**`/*`下的内容，并将用户访问的query参数，以及以下三个query参数，以query参数的形式传给iframe。

| 参数            | 取值                  | 解释                                                          |
| --------------- | --------------------- | ------------------------------------------------------------- |
| `scowDark`      | `"true" \| "false"`   | 当前SCOW是否以黑暗主题显示                                    |
| `scowUserToken` | `string \| undefined` | 当前SCOW的登录用户的token。可通过SCOW认证系统接口查询登录用户 |
| `scowLangId`    | `string`              | 当前SCOW显示所使用的语言ID                                    |

例如，假设SCOW部署于`https://myscow.com/scow`，您的扩展站部署于`https://myscowext.com/ext`，当用户访问`https://myscow/scow/extensions/parent/child?test=123`时，SCOW将会显示一个iframe，其URL为`https://myscowext.com/ext/parent/child?test=123&scowDark={当前SCOW是否以黑暗模式显示}&scowUserToken={用户token}&scowLangId={当前SCOW显示语言ID}`。

### 配置接口

除此之外，UI扩展站需要实现以下的配置接口。SCOW会在需要的使用调用以下接口获取响应配置。

#### 获取清单：GET /manifests

获取UI扩展配置清单。SCOW通过此接口获取您的UI扩展的一些配置参数。

对于此接口，您需要返回如下类型的JSON内容：

| JSON属性路径                | 类型   | 是否必须 | 解释                                    |
| --------------------------- | ------ | -------- | --------------------------------------- |
| `portal`                    | 对象   | 否       | 关于门户系统的配置                      |
| `portal.rewriteNavigations` | 布尔值 | 否       | 是否重写门户系统的导航项。默认为`false` |
| `mis`                       | 对象   | 否       | 关于管理系统的配置                      |
| `mis.rewriteNavigations`    | 布尔值 | 否       | 是否重写管理系统的导航项。默认为`false` |

例如，您可以返回如下类型的JSON，表示要重写门户系统的导航项，但是不重写管理系统的导航项。

```json
{
  "portal": {
    "rewriteNavigations": true
  },
  "mis": {
    "rewriteNavigations": false,
  }
}
```

#### 重写门户系统的导航项：POST /portal/rewriteNavigations

重写门户系统的导航项。若您在`GET /manifests`中返回的`portal.rewriteNavigations`为`true`，则必须实现此接口。

SCOW将会在body中传入默认情况下SCOW将会显示的导航项。下表为传入的JSON参数的属性：

| JSON属性路径           | 类型                                   | 是否必须 | 解释                                                                                      |
| ---------------------- | -------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `navs`                 | 对象数组                               | 是       | 导航项                                                                                    |
| `navs[].path`          | 字符串                                 | 是       | 此导航项的路径。此路径不包括base path。若当前浏览器的pathname以此开头，则此导航项将会高亮 |
| `navs[].clickToPath`   | 字符串                                 | 否       | 点击此导航项将会导航至的路径。如果不填，则使用`path`属性                                  |
| `navs[].text`          | 字符串                                 | 是       | 导航项的文本                                                                              |
| `navs[].openInNewPage` | 布尔值                                 | 是       | 此导航项的页面是否在新窗口中打开                                                          |
| `navs[].children`      | 对象数组，类型与`navs`数组的每一项相同 | 否       | 此导航项的子项。                                                                          |

同时，SCOW会传入以下参数作为query参数。

| 参数            | 取值                  | 解释                                                          |
| --------------- | --------------------- | ------------------------------------------------------------- |
| `scowDark`      | `"true" \| "false"`   | 当前SCOW是否以黑暗主题显示                                    |
| `scowUserToken` | `string \| undefined` | 当前SCOW的登录用户的token。可通过SCOW认证系统接口查询登录用户 |
| `scowLangId`    | `string`              | 当前SCOW显示所使用的语言ID                                    |

您需要返回以下类型的JSON，表示重写后的门户系统的导航项。


| JSON属性路径           | 类型                                   | 是否必须 | 解释                                                                                                                                    |
| ---------------------- | -------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `navs`                 | 对象数组                               | 是       | 导航项                                                                                                                                  |
| `navs[].path`          | 字符串                                 | 是       | 此导航项的路径。此路径不包括base path。若当前浏览器的pathname以此开头，则此导航项将会高亮                                               |
| `navs[].clickToPath`   | 字符串                                 | 否       | 点击此导航项将会导航至的路径。如果不填，则使用`path`属性                                                                                |
| `navs[].text`          | 字符串                                 | 是       | 导航项的文本                                                                                                                            |
| `navs[].iconSrc`       | 图标URL                                | 否       | 导航项的图标地址。必须是完整的、可公开访问的URL。如果不填，将显示[Ant Design Icon](https://ant.design/components/icon-cn)的LinkOutlined |
| `navs[].iconAlt`       | 布尔值                                 | 否       | 导航项的图标alt属性。可不填                                                                                                             |
| `navs[].openInNewPage` | 布尔值                                 | 是       | 此导航项的页面是否在新窗口中打开                                                                                                        |
| `navs[].children`      | 对象数组，类型与`navs`数组的每一项相同 | 否       | 此导航项的子项。                                                                                                                        |


#### 重写管理系统的导航项：POST /mis/rewriteNavigations

重写门户系统的导航项。若您在`GET /manifests`中返回的`mis.rewriteNavigations`为`true`，则必须实现此接口。

此接口的参数及响应与门户系统的完全相同。

## 配置SCOW使用UI扩展

当您的扩展站开发并部署完成后，请在`config/portal.yaml`和/或`config/mis.yaml`中增加以下内容，以开启SCOW UI扩展。

```yaml title="config/{portal,mis}.yaml"
uiExtension:
  # 您的UI扩展页部署URL
  url: http://localhost:16566/basepath
```

## 实现注意事项

- UI扩展示例项目：[PKUHPC/scow-ui-extension-demo](https://github.com/PKUHPC/scow-ui-extension-demo)
- 如果您的扩展站和SCOW部署地址非同源，请注意使得您的扩展站的所有路径均支持CORS访问。
    - Next.js项目可以参考[示例项目中的`src/middleware.ts`](https://github.com/PKUHPC/scow-ui-extension-demo/blob/main/src/middleware.ts)


