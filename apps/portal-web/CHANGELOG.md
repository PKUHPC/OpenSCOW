# @scow/portal-web

## 0.7.0

### Patch Changes

- 1aad4a345: 去掉 web 端多余的逗号
- 5b8b8be2c: 修复 dev container 和本地 vagrant 开发模式下集群配置不一致问题
- 09bcc565b: 交互式应用已创建的应用列表新增状态过滤，默认展示运行中应用
- 31198304c: portal-web 使用 custom server 注册 upgrade 事件，更新 next.js 至最新并恢复日常更新
- f74d6c6e1: 修复文件列表文件标题不可点击问题
- e011f42ff: 门户和管理系统添加 footer 展示 SCOW 版本和 github 跳转链接
- 8cf189cd2: 修改了 config 中 ENABLE_CHANGE_PASSWORD 与 authSupportsCreateUser 的类型属性可以为 Undefined
- 31b1662df: 修改 formatSize 公共函数传参单位统一问题
- 932c01255: portal-web 交互式应用列表状态筛选改为勾选只展示未结束的作业
- 27d346fd8: 修复 portal-web 项目 API 路径没有正确添加 base path 的问题
- a07fed634: 文件选择器及提交作业允许选择任意目录
- 4e304b61e: 提交作业选择文件目录后，工作目录不随作业名改变
- 81895f4be: mis.yaml 和 portal.yaml 中支持增加导航链接
- Updated dependencies [31198304c]
- Updated dependencies [e011f42ff]
- Updated dependencies [0f64e5404]
- Updated dependencies [4bfd80986]
- Updated dependencies [81895f4be]
- Updated dependencies [81895f4be]
  - @scow/lib-web@0.3.3
  - @scow/config@0.3.1
  - @scow/lib-auth@0.2.1
  - @scow/protos@0.2.3

## 0.6.0

### Patch Changes

- dc51bfde6: 浏览器关闭后，用户登录 cookie 失效
- 01e18fa28: 临时解决 Shell 和 VNC 类应用不可用的问题
- 7903c8cbd: 修复 app 自定义表单默认选项无法提交的问题
- 8b36bf0bc: 当交互式应用列表中存在内容时，刷新交互式应用列表不会使表格进入正在加载状态
- d2c8e765e: 优化创建交互式应用页面：在用户家目录下的 apps/app[Id]路径下存入上一次提交记录；创建了查找上一次提交记录的 API 接口，每次创建交互式应用时查找上一次提交记录，如果有则与当前集群下配置对比选择填入相应的值。
- 6021d29d7: 门户网站提交作业选择工作目录新增文件夹选择功能
- 020e7b8e0: 修改已创建的交互式应用页面刷新 checkbox 为居中显示
- 4ef4ddef6: 修复成功删除错误文件时的提醒
- 8b36bf0bc: 检查交互式应用是否可连接的逻辑移动到前端
- 0dcecf742: 提交作业页面显示优化：1.增加 integer 输入框的最大值输入限制及向下取整，并增加光标失焦后填写默认值最小值；2.修改内存显示；3.修改默认作业名显示；4.在 code-editor 中添加优先级提示语言的 placeholder。
- 7a64b72b0: 更新文件上传时文件列表中取消按钮的提示文本
- Updated dependencies [901ecdb7e]
- Updated dependencies [01e18fa28]
- Updated dependencies [d2c8e765e]
- Updated dependencies [ce077930a]
  - @scow/config@0.3.0
  - @scow/lib-web@0.3.2
  - @scow/lib-config@0.2.2
  - @scow/protos@0.2.2

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
