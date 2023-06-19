# @scow/lib-web

## 0.3.3

### Patch Changes

- 31198304c: portal-web 使用 custom server 注册 upgrade 事件，更新 next.js 至最新并恢复日常更新
- e011f42ff: 门户和管理系统添加 footer 展示 SCOW 版本和 github 跳转链接
- 81895f4be: mis.yaml 和 portal.yaml 中支持增加导航链接

## 0.3.2

### Patch Changes

- 01e18fa28: 临时解决 Shell 和 VNC 类应用不可用的问题

## 0.3.1

### Patch Changes

- fc36c57ca: 修复 web 项目第一次访问时页面布局混乱的问题
- caefcddcd: 前端显示用户姓名时使用认证系统返回的用户姓名

## 0.3.0

### Minor Changes

- 86e0f5b2d: 整个系统打包为一个镜像

### Patch Changes

- ff7eec37e: 修复因 table 超出页面的问题，搜索模块、个人信息页面手机端样式兼容
- Updated dependencies [bdc990a0c]
  - @scow/utils@0.1.2

## 0.2.0

### Minor Changes

- c2a1dff41: 自定义 footer 和 portal 的 dashboard 文本支持 HTML 标签
- 5e4f6ac58: 支持动态设置 base path
- a9b64169c: 更新 LOGO、favicon、仪表盘图片的自定义方式

### Patch Changes

- 93eb54ea6: 修复图片没有正确加上 base path
- Updated dependencies [c24e21662]
  - @scow/utils@0.1.1
