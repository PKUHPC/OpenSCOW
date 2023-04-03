# @scow/docs

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
