# @scow/resource

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
