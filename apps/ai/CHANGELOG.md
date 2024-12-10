# @scow/ai

## 0.2.12

### Patch Changes

- 7363662: 增加 ai 仪表盘
- b3f2c15: AI 增加国际化
- ca98dac: 在 SCOW 的 light mode 和 dark mode 下，可以选择两种不同的主题色
- 0a670dc: 不能讲软链接作为挂载点，前端可以直接选择用户家目录作为挂载点
- 35f48a8: AI 训练界面优化：如果选择了镜像|算法|模型|数据，展示相关描述信息
- Updated dependencies [1adb22b]
- Updated dependencies [0a670dc]
- Updated dependencies [46dfcf9]
- Updated dependencies [249d35d]
- Updated dependencies [c641401]
- Updated dependencies [ca98dac]
- Updated dependencies [7363662]
  - @scow/lib-web@1.4.7
  - @scow/lib-ssh@1.0.4
  - @scow/lib-operation-log@2.1.13
  - @scow/config@1.6.2
  - @scow/ai-scheduler-adapter-protos@1.1.0
  - @scow/protos@1.0.19
  - @scow/lib-scow-resource@0.2.3
  - @scow/lib-server@1.3.8
  - @scow/rich-error-model@2.0.1
  - @scow/lib-scheduler-adapter@1.1.17

## 0.2.11

### Patch Changes

- Updated dependencies [b0a38e0]
  - @scow/lib-operation-log@2.1.12
  - @scow/rich-error-model@2.0.1
  - @scow/lib-scheduler-adapter@1.1.16
  - @scow/lib-server@1.3.7
  - @scow/lib-web@1.4.6

## 0.2.10

### Patch Changes

- 87ff0e7: 修改 HPC 和 AI 的作业和应用的默认工作目录命名规则
- 1a531ed: 已部署管理系统与资源管理系统的情况下，可以对 AI 集群的集群信息进行授权
- 56e0152: 更新 @grpc/grpc-js 到 1.12.2
- f75af4b: hpc 应用作业列表和 AI 的作业列表修改作业名获取方式
- 56e0152: scow 和 适配器交互添加双向 tls 校验
- Updated dependencies [aeac587]
- Updated dependencies [1a531ed]
- Updated dependencies [56e0152]
- Updated dependencies [56e0152]
  - @scow/config@1.6.1
  - @scow/ai-scheduler-adapter-protos@1.0.1
  - @scow/lib-scheduler-adapter@1.1.15
  - @scow/rich-error-model@2.0.1
  - @scow/lib-operation-log@2.1.11
  - @scow/lib-scow-resource@0.2.2
  - @scow/lib-server@1.3.6
  - @scow/lib-web@1.4.5

## 0.2.9

### Patch Changes

- bec8a37: ai 增加公共只读挂载点
- 9880cd0: 去掉 HPC 和 AI 的提交应用和训练的检查重名
- a021f77: 训练选择挂载点提示字段验证错误
- c587554: ai 运行中的作业保存镜像改成异步
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
  - @scow/lib-auth@1.0.1
  - @scow/lib-web@1.4.4
  - @scow/rich-error-model@2.0.0

## 0.2.8

### Patch Changes

- Updated dependencies [a16b1e1]
- Updated dependencies [721b227]
- Updated dependencies [9895952]
- Updated dependencies [0f02d9d]
- Updated dependencies [5746037]
  - @scow/lib-server@1.3.4
  - @scow/lib-operation-log@2.1.9
  - @scow/config@1.5.3
  - @scow/lib-web@1.4.3
  - @scow/rich-error-model@2.0.0

## 0.2.7

### Patch Changes

- Updated dependencies [d32b7f6]
  - @scow/lib-server@1.3.3
  - @scow/lib-ssh@1.0.3

## 0.2.6

### Patch Changes

- 5ba5ebb: 修复 AI 应用的工作目录和挂载点重复时报错
- e776999: ai 和 hpc 在提交作业和应用前检查一下是否重名
- 3d36aa0: TensorFlow 增加 psNode 和 workerNode 参数
- Updated dependencies [eec12d8]
- Updated dependencies [b2ee159]
- Updated dependencies [d3de802]
- Updated dependencies [acb1992]
- Updated dependencies [15a7bdd]
- Updated dependencies [abd69cb]
- Updated dependencies [83df60b]
  - @scow/lib-web@1.4.2
  - @scow/lib-operation-log@2.1.8
  - @scow/lib-server@1.3.2
  - @scow/config@1.5.2
  - @scow/rich-error-model@2.0.0

## 0.2.5

### Patch Changes

- fcc8c2b: ai 的数据库密码先从 install.yaml 中读取，若没配再从 ai 的 config 中读取
- 753a996: AI 增加多机多卡分布式训练和对华为 GPU 的特殊处理
- be429fc: ai 加上国际化的 Provider
- ca9bf27: 兼容低版本 chrome 浏览器，兼容 360 极速浏览器
- e9c8bfa: 增加 ai 的操作日志，涉及文件、镜像、数据集、算法、模型和作业应用'
- Updated dependencies [0275a9e]
- Updated dependencies [c61348a]
- Updated dependencies [753a996]
- Updated dependencies [57a91f6]
- Updated dependencies [a9e9011]
- Updated dependencies [66f3c0e]
- Updated dependencies [1a096de]
- Updated dependencies [5159efd]
- Updated dependencies [259f247]
- Updated dependencies [0eb668d]
- Updated dependencies [e9c8bfa]
- Updated dependencies [f14bf6c]
  - @scow/config@1.5.1
  - @scow/lib-ssh@1.0.2
  - @scow/lib-web@1.4.1
  - @scow/utils@1.1.1
  - @scow/lib-server@1.3.1
  - @scow/lib-operation-log@2.1.7
  - @scow/rich-error-model@2.0.0

## 0.2.4

### Patch Changes

- be61c74: 所有 Input.group compact 组件替换成 Space.Compact

## 0.2.3

### Patch Changes

- b8d1270: 同步操作日志服务中的日志类型，增加启用集群，停用集群
- Updated dependencies [b8d1270]
- Updated dependencies [b8d1270]
- Updated dependencies [806f778]
  - @scow/config@1.5.0
  - @scow/lib-server@1.3.0
  - @scow/lib-web@1.4.0
  - @scow/lib-operation-log@2.1.6
  - @scow/rich-error-model@2.0.0
  - @scow/lib-scheduler-adapter@1.1.10

## 0.2.2

### Patch Changes

- f534377: 增加了 mis portal 中表格排序的功能，以及部分 UI 的修改
- 7bcf3bb: AI 新增再次提交作业功能
- 0957f1a: 修改多平台镜像由于只在 nerdclt push 命令下指定 --all-platforms 导致其他平台层数据缺失无法推送的问题
- d080a8b: 增加 ai 系统下个人信息中修改密码的后端校验
- 6304074: 提交作业时，新增保留作业脚本的选项
- 44c8d67: 修改 copy 命令
- ad1a565: 数据集、算法、模型的分享去掉源文件地址参数；复制命令换用处理过的命令
- Updated dependencies [d080a8b]
- Updated dependencies [f534377]
  - @scow/config@1.4.5
  - @scow/lib-web@1.3.3
  - @scow/lib-operation-log@2.1.5
  - @scow/lib-server@1.2.2
  - @scow/rich-error-model@2.0.0
  - @scow/lib-scheduler-adapter@1.1.9

## 0.2.1

### Patch Changes

- 55a619e: 修复 更新算法和模型时查找已存在实体逻辑错误的问题
- c178b72: xterm npm 包更名
- 01bd823: 修复 trpc openapi 将 boolean params 全部转为 string 的问题
- e312efb: AI 模块支持创建 vnc 类型应用
- a737493: jupyter 启动命令参数 PasswordIdentityProvider.hashed_password 改为 ServerApp.password
- e312efb: ai 增加 vnc 功能，以 shell 方式进入容器功能和提交作业的优化
- a4d36e2: 启用 serverMinification，只关闭 name mangling
- 37fdf7e: 修改了 portal 中的部分 UI 样式,bannerTop 导航文字
- e312efb: ai 新增以 shell 的方式进入容器的功能
- Updated dependencies [94aa24c]
- Updated dependencies [e312efb]
- Updated dependencies [e312efb]
- Updated dependencies [640a599]
  - @scow/config@1.4.4
  - @scow/lib-web@1.3.2
  - @scow/scheduler-adapter-protos@1.3.1
  - @scow/lib-operation-log@2.1.4
  - @scow/lib-server@1.2.1
  - @scow/lib-scheduler-adapter@1.1.8
  - @scow/rich-error-model@2.0.0

## 0.2.0

### Minor Changes

- 63d1873: 账户新增封锁阈值，租户新增默认账户默认阈值以

### Patch Changes

- 3c5c8a6: 修复大镜像在 Containerd 运行时推送失败的问题
- a097dd1: 新增无账户关系的用户修改所属租户且可以作为新增租户的管理员功能
- 4e14446: 修复集群 partitions 为空时，页面崩溃的问题以及拼写错误
- 01cfdae: 修改对于 ssh 命令执行错误的判断
- 02d6a18: 新增集群区分 AI 功能和 HPC 功能配置
- b8d7684: 修复 ai 中创建或复制文件数据检查源文件时，后台没有打印日志的问题
- 24db413: 操作日志增加自定义操作类型
- d822db7: ai 系统新增支持 k8s 集群的 containerd 运行时
- 6d4b22c: AI 系统创建应用和训练页面 UI 交互优化
- 0f5d48f: 修复 AI 训练 coreCount 在 gpu 下传参错误问题
- Updated dependencies [02d6a18]
- Updated dependencies [146e19f]
- Updated dependencies [63d1873]
- Updated dependencies [24db413]
- Updated dependencies [d822db7]
- Updated dependencies [850a7ee]
  - @scow/config@1.4.3
  - @scow/lib-web@1.3.1
  - @scow/lib-server@1.2.0
  - @scow/lib-operation-log@2.1.3
  - @scow/rich-error-model@2.0.0
  - @scow/lib-scheduler-adapter@1.1.7

## 0.1.1

### Patch Changes

- 3242957: 修复创建失败的镜像无法删除的问题
- 8cba2eb: 修复修改模型版本时校验名称重复错误问题
- Updated dependencies [443187e]
- Updated dependencies [3242957]
- Updated dependencies [850bbcd]
  - @scow/lib-server@1.1.5
  - @scow/config@1.4.2
  - @scow/lib-operation-log@2.1.2
  - @scow/lib-web@1.3.0
  - @scow/rich-error-model@2.0.0
  - @scow/lib-scheduler-adapter@1.1.6
