# @scow/audit-server

## 2.3.12

### Patch Changes

- Updated dependencies [cd75359]
  - @scow/lib-operation-log@2.1.14
  - @scow/protos@1.0.20
  - @scow/lib-server@1.3.9

## 2.3.11

### Patch Changes

- 46dfcf9: 增加导出已结束作业功能
- Updated dependencies [46dfcf9]
- Updated dependencies [c641401]
- Updated dependencies [ca98dac]
  - @scow/lib-operation-log@2.1.13
  - @scow/config@1.6.2
  - @scow/protos@1.0.19
  - @scow/lib-server@1.3.8

## 2.3.10

### Patch Changes

- Updated dependencies [b0a38e0]
  - @scow/lib-operation-log@2.1.12
  - @scow/protos@1.0.18
  - @scow/lib-server@1.3.7

## 2.3.9

### Patch Changes

- 56e0152: 更新 @grpc/grpc-js 到 1.12.2
- Updated dependencies [aeac587]
- Updated dependencies [1a531ed]
- Updated dependencies [56e0152]
  - @scow/config@1.6.1
  - @scow/lib-operation-log@2.1.11
  - @scow/protos@1.0.17
  - @scow/lib-server@1.3.6

## 2.3.8

### Patch Changes

- 6c6f8c6: 新增删除用户账户功能以及用户账户的删除状态带来的其他相关接口与测试文件完善
- 6c6f8c6: 账户列表导出时增加拥有者 ID 和姓名筛选，操作日志修正为导出账户
- Updated dependencies [bec8a37]
- Updated dependencies [9880cd0]
- Updated dependencies [6c6f8c6]
- Updated dependencies [a7e7585]
- Updated dependencies [6c6f8c6]
- Updated dependencies [701ebc7]
- Updated dependencies [aa94edc]
  - @scow/config@1.6.0
  - @scow/lib-server@1.3.5
  - @scow/lib-operation-log@2.1.10
  - @scow/protos@1.0.16

## 2.3.7

### Patch Changes

- Updated dependencies [a16b1e1]
- Updated dependencies [721b227]
- Updated dependencies [9895952]
  - @scow/lib-server@1.3.4
  - @scow/lib-operation-log@2.1.9
  - @scow/config@1.5.3
  - @scow/protos@1.0.15

## 2.3.6

### Patch Changes

- d32b7f6: 修复 shell 退出时 ssh 连接未正常关闭的问题
- Updated dependencies [d32b7f6]
  - @scow/lib-server@1.3.3

## 2.3.5

### Patch Changes

- Updated dependencies [abd69cb]
- Updated dependencies [83df60b]
  - @scow/lib-operation-log@2.1.8
  - @scow/lib-server@1.3.2
  - @scow/config@1.5.2
  - @scow/protos@1.0.14

## 2.3.4

### Patch Changes

- Updated dependencies [0275a9e]
- Updated dependencies [753a996]
- Updated dependencies [a9e9011]
- Updated dependencies [1a096de]
- Updated dependencies [0eb668d]
- Updated dependencies [e9c8bfa]
  - @scow/config@1.5.1
  - @scow/utils@1.1.1
  - @scow/lib-server@1.3.1
  - @scow/lib-operation-log@2.1.7
  - @scow/protos@1.0.13

## 2.3.3

### Patch Changes

- Updated dependencies [b8d1270]
- Updated dependencies [b8d1270]
- Updated dependencies [806f778]
  - @scow/config@1.5.0
  - @scow/lib-server@1.3.0
  - @scow/lib-operation-log@2.1.6
  - @scow/protos@1.0.12

## 2.3.2

### Patch Changes

- f534377: 增加了 mis portal 中表格排序的功能，以及部分 UI 的修改
- Updated dependencies [d080a8b]
  - @scow/config@1.4.5
  - @scow/lib-operation-log@2.1.5
  - @scow/lib-server@1.2.2
  - @scow/protos@1.0.11

## 2.3.1

### Patch Changes

- Updated dependencies [94aa24c]
- Updated dependencies [e312efb]
- Updated dependencies [e312efb]
- Updated dependencies [640a599]
  - @scow/config@1.4.4
  - @scow/lib-operation-log@2.1.4
  - @scow/lib-server@1.2.1
  - @scow/protos@1.0.10

## 2.3.0

### Minor Changes

- 63d1873: 账户新增封锁阈值，租户新增默认账户默认阈值以

### Patch Changes

- 24db413: 操作日志增加自定义操作类型
- d3d891a: 操作日志详细内容展示优化
- Updated dependencies [02d6a18]
- Updated dependencies [63d1873]
- Updated dependencies [24db413]
- Updated dependencies [d822db7]
  - @scow/config@1.4.3
  - @scow/lib-server@1.2.0
  - @scow/lib-operation-log@2.1.3
  - @scow/protos@1.0.9

## 2.2.2

### Patch Changes

- 443187e: 修复数据统计相关功能时区转换问题
- Updated dependencies [443187e]
- Updated dependencies [3242957]
- Updated dependencies [850bbcd]
  - @scow/lib-server@1.1.5
  - @scow/config@1.4.2
  - @scow/protos@1.0.8
  - @scow/lib-operation-log@2.1.2

## 2.2.1

### Patch Changes

- Updated dependencies [afc3350]
- Updated dependencies [8d417ba]
- Updated dependencies [68447f7]
  - @scow/lib-config@1.0.1
  - @scow/config@1.4.1
  - @scow/lib-operation-log@2.1.1
  - @scow/protos@1.0.7

## 2.2.0

### Minor Changes

- 081fbcf: 管理系统新增用户列表，账户列表，消费记录，充值记录，操作记录的数据导出 csv 文件功能
- f023d52: 管理系统新增数据统计功能，统计用户，账户，租户，作业，消费及功能使用次数

### Patch Changes

- Updated dependencies [081fbcf]
- Updated dependencies [d1c2e74]
- Updated dependencies [abb7e84]
  - @scow/lib-operation-log@2.1.0
  - @scow/config@1.4.0
  - @scow/protos@1.0.6

## 2.1.3

### Patch Changes

- 484c70aeef: 修复操作日志模糊搜索和操作类型及操作账户共同筛选报错
- Updated dependencies [ec06733f9f]
  - @scow/config@1.3.0
  - @scow/protos@1.0.5

## 2.1.2

### Patch Changes

- Updated dependencies [cad49a87d8]
  - @scow/config@1.2.1
  - @scow/protos@1.0.4

## 2.1.1

### Patch Changes

- @scow/protos@1.0.3

## 2.1.0

### Minor Changes

- a78a6e0b56: 操作日志新增操作内容模糊搜索功能

### Patch Changes

- af6a53dfcf: portal-server,auth,mis-server,audit-server 下 pino 日志的时间格式修改为八时区下的 YYYY-MM-DD HH:mm:ss
- 3bb178aebd: 修改页面表格默认显示数量为 50
- Updated dependencies [a3d2f44af6]
- Updated dependencies [5d2b75ccec]
- Updated dependencies [135f2b1be3]
- Updated dependencies [f577d9d1e4]
  - @scow/config@1.2.0
  - @scow/utils@1.1.0
  - @scow/protos@1.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [b33a2bd6bc]
- Updated dependencies [b7f01512eb]
- Updated dependencies [5bb922fe99]
- Updated dependencies [ccbde14304]
- Updated dependencies [50d34d6ae3]
- Updated dependencies [29e4b1880a]
- Updated dependencies [8fc4c21f07]
  - @scow/config@1.1.0
  - @scow/protos@1.0.1
