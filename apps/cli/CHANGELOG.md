# @scow/cli

## 0.7.0

### Minor Changes

- 548bce714: 支持 CLI 插件

### Patch Changes

- bba446a18: 支持公共文件配置
- 4125d2ca0: 修复 CLI 初始化时，public/README.md 中文档不正确
- 81895f4be: mis.yaml 和 portal.yaml 中支持增加导航链接
- Updated dependencies [0f64e5404]
- Updated dependencies [81895f4be]
  - @scow/config@0.3.1

## 0.6.0

### Minor Changes

- 901ecdb7e: 支持使用外部页面创建用户

### Patch Changes

- Updated dependencies [901ecdb7e]
- Updated dependencies [d2c8e765e]
- Updated dependencies [ce077930a]
  - @scow/config@0.3.0
  - @scow/lib-config@0.2.2

## 0.5.0

### Minor Changes

- 47b99ad80: CLI 使用 pino logger
- 1562ebbd2: 提交作业时增加 GPU 选项

### Patch Changes

- 9a2ddbdd9: 当配置了 fluentd 日志，在执行 compose 命令或者生成 compose 配置时创建 log 目录并修改权限
- 943195451: 认证系统支持测试用户功能
- 7c4c857f5: 修改 init 出错
- 42b4cd123: cli 支持设置 HTTP 代理
- 695e5d590: install.yaml 支持配置网关服务器超时时间
- bbdf9390d: 修复系统 base path 和门户 base path 均为/时，管理系统不显示到门户的链接
- 1abd64a75: CLI 自定义认证系统环境变量配置允许字典形式
- 5411d4d64: cli 增加 check-config 命令，可检查 SCOW 配置文件格式
- cb90eb64b: 门户支持配置代理网关节点
- 8b10d20f1: 初始化时增加 fluent 配置文件
- f52067437: 修复 cli 更新 release 版本
- Updated dependencies [7bd2578c4]
- Updated dependencies [ef8b7eee0]
- Updated dependencies [9cb6822e6]
- Updated dependencies [74d718ba1]
- Updated dependencies [d6e06e841]
- Updated dependencies [cb90eb64b]
  - @scow/config@0.2.0
  - @scow/lib-config@0.2.1

## 0.4.0

### Minor Changes

- 8145061ba: 增加 scow-cli

### Patch Changes

- Updated dependencies [8145061ba]
  - @scow/lib-config@0.2.0
