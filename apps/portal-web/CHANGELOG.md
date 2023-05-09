# @scow/portal-web

## 0.5.0

### Minor Changes

- 2981664f4: 门户所有作业列增加开始、结束时间列，增加时间说明
- aa4d0ff1c: 为 PENDING 等需要显示作业未运行原因的状态的 APP，显示原因
- 7bd2578c4: SCOW API 增加静态 token 认证方法
- 88899d41f: 提交任务增加默认输出文件
- 1562ebbd2: 提交作业时增加 GPU 选项

### Patch Changes

- c50cb37d7: 修复使用模板时所有下拉列表项无法应用的问题
- 4dbb2028f: 修复 PENDING 状态的作业无法取消的问题
- fc36c57ca: 修复 web 项目第一次访问时页面布局混乱的问题
- a7fd75778: 修复文件管理界面，操作无权限文件/文件夹时页面的错误提示
- 8268e348e: 修改 DELETE 请求 body 为 query 使其合规
- 1c8d3e1c0: 提交作业时必须指定分区
- 02b5f6e22: 用户自定义表单默认选择第一项
- caefcddcd: 前端显示用户姓名时使用认证系统返回的用户姓名
- 3b0684b63: 文件管理页面新增按钮显示/不显示隐藏文件
- ce27d87ae: 文件管理页面排序优化，去除文件类型排序，默认文件名升序排序，文件和文件夹分开排序，其他属性排序一致时，按照名称排序
- e56b5c7db: Portal Web Shell 界面的标题显示集群 name
- 8de278c21: 文件管理系统下的文件夹不展示文件大小
- d6e06e841: 读取配置文件时允许传入 logger 对象
- 6a3bb43a8: portal web 文件管理页面展示文件大小按照单位展示最多三位有效数字，实际文件大小鼠标悬浮展示
- cb90eb64b: 门户支持配置代理网关节点
- Updated dependencies [c2a8ab7a5]
- Updated dependencies [5c066e4a5]
- Updated dependencies [bb9d9bb8b]
- Updated dependencies [215ac2fc7]
- Updated dependencies [fc36c57ca]
- Updated dependencies [7bd2578c4]
- Updated dependencies [ef8b7eee0]
- Updated dependencies [9cb6822e6]
- Updated dependencies [74d718ba1]
- Updated dependencies [caefcddcd]
- Updated dependencies [1562ebbd2]
- Updated dependencies [d6e06e841]
- Updated dependencies [cb90eb64b]
  - @scow/lib-auth@0.2.0
  - @scow/lib-ssh@0.3.0
  - @scow/lib-web@0.3.1
  - @scow/config@0.2.0
  - @scow/lib-config@0.2.1
  - @scow/protos@0.2.1

## 0.4.0

### Minor Changes

- 86e0f5b2d: 整个系统打包为一个镜像
- 882a247a1: 重构 app 的 sbatch options，gRPC 中与 custom_attributes 一起发送
- 523b4f8f2: 上传文件、请求最大体积限制可配置
- d4b0cde25: 创建 web 类交互式应用时由前端传入 base path，将节点名解析为 IP 地址的工作由 portal-server 完成
- 22a5bc3c2: 支持 shell 中跳转文件系统

### Patch Changes

- 944d56605: 修复文件管理界面打开终端问题
- bdc990a0c: 系统启动时，各个容器在日志中打印版本信息
- 419184a93: 修复 home 目录下创建文件夹失败的问题
- debcf7bc3: 从最终镜像中去除 next.js build cache，减小镜像大小
- 419184a93: 统一处理多个 sftp 操作命令报错
- ff7eec37e: 修复因 table 超出页面的问题，搜索模块、个人信息页面手机端样式兼容
- c860e7710: 禁止点击蒙层关闭上传文件对话框
- 1c8a948d8: 把代码中 SavedJobs 字样全部改为 JobTemplate
- Updated dependencies [bdc990a0c]
- Updated dependencies [86e0f5b2d]
- Updated dependencies [419184a93]
- Updated dependencies [ff7eec37e]
- Updated dependencies [8145061ba]
  - @scow/utils@0.1.2
  - @scow/lib-decimal@0.2.0
  - @scow/protos@0.2.0
  - @scow/lib-ssh@0.2.0
  - @scow/lib-web@0.3.0
  - @scow/lib-config@0.2.0
  - @scow/config@0.1.2

## 0.3.0

### Patch Changes

- @scow/protos@0.1.1

## 0.2.0

### Minor Changes

- 686054ac3: 增加 ListAvailableWms API
- c2a1dff41: 自定义 footer 和 portal 的 dashboard 文本支持 HTML 标签
- 5cd477d37: 门户系统修改 getAppAttributes API 为 getAppMetadata，从 portal-server 获取应用名称
- 5e4f6ac58: 支持动态设置 base path
- a9b64169c: 更新 LOGO、favicon、仪表盘图片的自定义方式

### Patch Changes

- 7d7bc0834: 修复 BASE_PATH 为/时，点击导航栏的 shell 跳转地址错误的问题
- b6347a367: 更新 next.js 版本并开启自动更新
- 9244b1079: 删除多余的 console.log
- 93eb54ea6: 修复图片没有正确加上 base path
- 6814c3427: 交互式应用的自定义表单可以配置提示信息等
- Updated dependencies [c2a1dff41]
- Updated dependencies [93eb54ea6]
- Updated dependencies [5e4f6ac58]
- Updated dependencies [a9b64169c]
- Updated dependencies [6814c3427]
- Updated dependencies [c24e21662]
  - @scow/lib-web@0.2.0
  - @scow/config@0.1.1
  - @scow/lib-config@0.1.1
  - @scow/lib-decimal@0.1.1
  - @scow/utils@0.1.1

## 0.1.2

## 0.1.1
