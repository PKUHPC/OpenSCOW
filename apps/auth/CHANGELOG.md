# @scow/auth

## 0.6.0

### Minor Changes

- 6f1c9f24e: 增加了 otp 功能

### Patch Changes

- Updated dependencies [901ecdb7e]
- Updated dependencies [d2c8e765e]
- Updated dependencies [ce077930a]
  - @scow/config@0.3.0
  - @scow/lib-config@0.2.2

## 0.5.0

### Minor Changes

- c2a8ab7a5: 删除认证系统验证用户姓名的 API，通过认证系统获取用户姓名和管理系统数据库实现
- bb9d9bb8b: 认证系统 GET /user API 增加返回用户姓名和邮箱
- 215ac2fc7: 认证系统 GET /validateToken 改为 GET /public/validateToken
- 0b0413806: LDAP 认证系统支持不配置创建用户选项

### Patch Changes

- 6236865ab: 之前 captcha 验证码只能靠浏览器刷新，输入错误验证码提交两种方式进行刷新，现在可以直接点击验证码进行刷新
- b69716c12: 修复 captcha 前后端参数不一致导致验证码的 svg 图片不显示，从而前端只有验证码输入框的问题
- 943195451: 认证系统支持测试用户功能
- Updated dependencies [5c066e4a5]
- Updated dependencies [7bd2578c4]
- Updated dependencies [ef8b7eee0]
- Updated dependencies [9cb6822e6]
- Updated dependencies [74d718ba1]
- Updated dependencies [1562ebbd2]
- Updated dependencies [d6e06e841]
- Updated dependencies [cb90eb64b]
  - @scow/lib-ssh@0.3.0
  - @scow/config@0.2.0
  - @scow/lib-config@0.2.1

## 0.4.0

### Minor Changes

- 9a1d3b81b: 认证系统新建用户和组时支持删除预添加的属性

### Patch Changes

- bdc990a0c: 系统启动时，各个容器在日志中打印版本信息
- 883521f26: 修复当部署的端口号非 80 时，回调地址出错的问题
- ac298dc4a: 登录页面增加必填校验，增加 logo
- Updated dependencies [bdc990a0c]
- Updated dependencies [86e0f5b2d]
- Updated dependencies [419184a93]
- Updated dependencies [8145061ba]
  - @scow/utils@0.1.2
  - @scow/lib-ssh@0.2.0
  - @scow/lib-config@0.2.0
  - @scow/config@0.1.2

## 0.3.0

## 0.2.0

### Minor Changes

- dc9852988: 修改 ldap.searchBase 为必填
- 84fcc4bf3: 增加配置日志输出选项功能
- 401a21ebe: 限制登录系统可回调域名和增加相关配置

### Patch Changes

- Updated dependencies [6814c3427]
- Updated dependencies [c24e21662]
  - @scow/config@0.1.1
  - @scow/lib-config@0.1.1

## 0.1.2

### Patch Changes

- 230b944a: 测试发布流水线

## 0.1.1

### Patch Changes

- 07a196c4: 测试发布流水线
