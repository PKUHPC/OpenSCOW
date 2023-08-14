# @scow/docs

## 0.6.0

### Minor Changes

- 5b7f0e88f: 重构 scow，对接调度器适配器接口
- 5c3c63657: 实现登录节点桌面功能以及 TurboVNC 的安装路径在每个集群中单独配置

### Patch Changes

- b6a02e4ae: 补充 vagrant 初始化部署的文档
- 6b6f08ac7: 修正文档部分交互式应用配置更新内的关联链接错误
- 1840515c3: 暴露 gateway 的环境变量 extra，可增加 nginx 的 server 配置
- e97eb22fd: 集群配置登录节点新增节点展示名
- 7a9973aa0: 修改 HTTP API 定义方式，去除生成 api-routes-schemas.json 步骤

## 0.5.0

### Minor Changes

- 548bce714: 支持 CLI 插件

### Patch Changes

- 0d9e3c051: 添加以下交互式应用示例配置：baltamatica、emacs、igv、jupyterlab、octave、rstudio、xfce
- 0f64e5404: 获取桌面和应用列表时，不再解析节点域名到 IP
- 4bfd80986: 认证系统增加管理用户账户关系相关 API
- 81895f4be: mis.yaml 和 portal.yaml 中支持增加导航链接

## 0.4.0

### Minor Changes

- 901ecdb7e: 支持使用外部页面创建用户

### Patch Changes

- f76b41a66: 增加通过 api-v{API 版本号}的 tag 获取某具体 SCOW API 的 proto 文件的方式
- b796fca16: 文档中配置部分提及`check-config` CLI 命令

## 0.3.0

### Minor Changes

- c2a8ab7a5: 删除认证系统验证用户姓名的 API，通过认证系统获取用户姓名和管理系统数据库实现
- bb9d9bb8b: 认证系统 GET /user API 增加返回用户姓名和邮箱
- 47b99ad80: CLI 使用 pino logger
- 215ac2fc7: 认证系统 GET /validateToken 改为 GET /public/validateToken
- 6d08aa823: 文档网站支持本地搜索
- 7bd2578c4: SCOW API 增加静态 token 认证方法
- ef8b7eee0: 增加 SCOW Hook
- 88899d41f: 提交任务增加默认输出文件
- 1562ebbd2: 提交作业时增加 GPU 选项

### Patch Changes

- c4138d75a: 丰富 scow-cli 文档，增加下载参考命令
- 943195451: 认证系统支持测试用户功能
- 9cb6822e6: 集群和应用配置文件可放在子文件夹中
- 42b4cd123: cli 支持设置 HTTP 代理
- 02b5f6e22: 用户自定义表单默认选择第一项
- 5411d4d64: cli 增加 check-config 命令，可检查 SCOW 配置文件格式
- cb90eb64b: 门户支持配置代理网关节点
- f52067437: 修复 cli 更新 release 版本

## 0.2.0

### Minor Changes

- 9a1d3b81b: 认证系统新建用户和组时支持删除预添加的属性
- 8145061ba: 增加 scow-cli
- d4b0cde25: 创建 web 类交互式应用时由前端传入 base path，将节点名解析为 IP 地址的工作由 portal-server 完成
- 22a5bc3c2: 支持 shell 中跳转文件系统

### Patch Changes

- 9a9159505: 增加集群网络连接要求
- 883521f26: 修复当部署的端口号非 80 时，回调地址出错的问题
- 06cd94230: 刷新 slurm 封锁状态和同步作业信息状态功能放到平台调试中

## 0.1.0

### Minor Changes

- dc9852988: 修改 ldap.searchBase 为必填
- 84fcc4bf3: 增加配置日志输出选项功能
- c2a1dff41: 自定义 footer 和 portal 的 dashboard 文本支持 HTML 标签
- 5e4f6ac58: 支持动态设置 base path
- a9b64169c: 更新 LOGO、favicon、仪表盘图片的自定义方式
- 401a21ebe: 限制登录系统可回调域名和增加相关配置

### Patch Changes

- 6814c3427: 交互式应用的自定义表单可以配置提示信息等
- 3eacac0db: 添加刷新 slurm 封锁状态文档
