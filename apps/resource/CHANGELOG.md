# @scow/resource

## 0.2.6

### Patch Changes

- d0b5adb: 删除资源管理与 mis-server 后端相互调用时的冗余认证逻辑
- bfad31b: 为资源管理系统、通知系统、管理系统、门户系统服务与服务之间的调用增加 token 校验,
  ** 注意，此 commit 之后，如配置资源管理系统或者通知系统，则需要配置 SCOW API Token **
- Updated dependencies [bfad31b]
- Updated dependencies [afaec8b]
  - @scow/lib-server@1.3.10
  - @scow/config@1.6.3
  - @scow/lib-web@1.4.9
  - @scow/protos@1.0.21
  - @scow/lib-hook@1.0.21
  - @scow/lib-scheduler-adapter@1.1.19

## 0.2.5

### Patch Changes

- 770a527: 修正 portal、mis、resource 的国际化顺序
- 355a523: 修复将账户添加到白名单时没有获取到已授权分区以及解封账户时没有对未授权分区再次封锁的问题
  - @scow/protos@1.0.20
  - @scow/lib-hook@1.0.20
  - @scow/lib-scheduler-adapter@1.1.18
  - @scow/lib-server@1.3.9
  - @scow/lib-web@1.4.8

## 0.2.4

### Patch Changes

- ca98dac: 在 SCOW 的 light mode 和 dark mode 下，可以选择两种不同的主题色
- Updated dependencies [1adb22b]
- Updated dependencies [249d35d]
- Updated dependencies [c641401]
- Updated dependencies [ca98dac]
  - @scow/lib-web@1.4.7
  - @scow/config@1.6.2
  - @scow/protos@1.0.19
  - @scow/lib-hook@1.0.19
  - @scow/lib-server@1.3.8
  - @scow/lib-scheduler-adapter@1.1.17

## 0.2.3

### Patch Changes

- 035ff28: 修复授权分区模态框中出现不同集群相同分区名时搜索集群分区展示错误问题
- 597955e: 增加授权账户集群与取消授权账户集群的 Hook
- 4b7b331: 修复正常账户在授权 AI 集群后没有在 AI 集群下解封的问题
  - @scow/protos@1.0.18
  - @scow/lib-hook@1.0.18
  - @scow/lib-scheduler-adapter@1.1.16
  - @scow/lib-server@1.3.7
  - @scow/lib-web@1.4.6

## 0.2.2

### Patch Changes

- 1a531ed: 已部署管理系统与资源管理系统的情况下，可以对 AI 集群的集群信息进行授权
- 56e0152: 更新 @grpc/grpc-js 到 1.12.2
- 56e0152: scow 和 适配器交互添加双向 tls 校验
- Updated dependencies [aeac587]
- Updated dependencies [1a531ed]
- Updated dependencies [56e0152]
- Updated dependencies [56e0152]
  - @scow/config@1.6.1
  - @scow/scow-resource-protos@0.2.1
  - @scow/lib-scheduler-adapter@1.1.15
  - @scow/protos@1.0.17
  - @scow/lib-server@1.3.6
  - @scow/lib-web@1.4.5

## 0.2.1

### Patch Changes

- 74789b4: 修复资源系统配置项中关闭启动时的状态同步没有生效的问题
- 6a16c51: 修复排序后模态框数据没有锁定到上一次打开的数据信息的问题，优化集群连接失败时的授权分区模态框内的提示
- Updated dependencies [bec8a37]
- Updated dependencies [9880cd0]
- Updated dependencies [a7e7585]
- Updated dependencies [6c6f8c6]
- Updated dependencies [701ebc7]
- Updated dependencies [aa94edc]
  - @scow/config@1.6.0
  - @scow/lib-server@1.3.5
  - @scow/lib-web@1.4.4
  - @scow/protos@1.0.16
  - @scow/lib-scheduler-adapter@1.1.14

## 0.2.0

### Minor Changes

- 9895952: 新增资源管理系统，增加对租户/账户的集群，分区授权和取消授权的功能

### Patch Changes

- a16b1e1: 修复对特定分区操作的适配器接口报错信息处理，修复授权集群分区详情中集群名的展示
- 337a9c6: 修复按用户角色展示租户管理和平台管理下的资源授权页面的问题
- Updated dependencies [a16b1e1]
- Updated dependencies [721b227]
- Updated dependencies [9895952]
- Updated dependencies [0f02d9d]
- Updated dependencies [5746037]
  - @scow/lib-server@1.3.4
  - @scow/config@1.5.3
  - @scow/lib-web@1.4.3
  - @scow/scow-resource-protos@0.2.0
  - @scow/protos@1.0.15
  - @scow/lib-scheduler-adapter@1.1.13
