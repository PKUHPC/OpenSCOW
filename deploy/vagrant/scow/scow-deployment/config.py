# encoding: utf-8

# ------- 全局通用配置 -------
#
# COMMON.PORT: 整个系统的入口端口
# COMMON.BASE_PATH: 整个系统的部署根路径。以/开头，不要以/结尾，如果是根路径写"/"
# COMMON.IMAGE_BASE: 镜像仓库地址，据实际情况填写
# COMMON.IMAGE_TAG: 镜像tag，据实际情况填写
# 如果您的镜像是本地构建的，IMAGE_BASE和IMAGE_TAG必须和构建时.env.build中的值保持一致。
COMMON = {
  "PORT": 80,
  "BASE_PATH": "/",
  # "IMAGE_BASE": "mirrors.pku.edu.cn/pkuhpc/scow",
  "IMAGE_BASE": "ghcr.io/pkuhpc/scow",
  "IMAGE_TAG": "master",
}

#
# ------- 门户系统 -------
#
# PORTAL.BASE_PATH: 非必须，默认值为"/"
#                   若设置则/开头，不要以/结尾.
#                   如果BASE_PATH为/root1，PORTAL.BASE_PATH为/root2，那么最终访问门户系统的路径是/root1/root2
# PORTAL.NOVNC_IMAGE: novnc客户端的镜像地址。一般无需修改
PORTAL = {
  "BASE_PATH": "/",
#  "NOVNC_IMAGE": "ghcr.io/pkuhpc/novnc-client-docker:master"
}
# 若不部署门户系统，设置PORTAL = False
# PORTAL = False

#
# ------- 管理系统 -------
#
# MIS.BASE_PATH: 非必须，默认值为"/mis"
#                若设置则以/开头，不要以/结尾.
#                如果BASE_PATH为/root1，MIS.BASE_PATH为/root2，那么最终访问管理系统的路径是/root1/root2
# MIS.DB_PASSWORD：管理系统数据库的密码. 第一次启动管理系统时会使用此密码初始化管理系统数据库，之后如需修改需要手动在数据库中修改
MIS = {
#  "BASE_PATH": "/mis",
  "DB_PASSWORD": "must!chang3this"
}
# 若不部署管理系统，设置MIS = False
# MIS = False

#
# ------- 日志收集服务 -------
#
# FLUENTD.LOG_DIR：收集日志的目录，不存在会自动创建
FLUENTD = {
  "LOG_DIR": "/var/log/fluentd",
}
# 若不部署日志收集服务，FLUENTD = False
# FLUENTD = False

#
# ------ 自定义认证系统 -------
# 如果使用自带认证系统，请注释整个AUTH部分
# 默认使用自带认证系统
#
# AUTH = {
#   # 镜像地址。必填，只要是能访问的镜像地址即可。
#   "IMAGE": "ghcr.io/pkuhpc/scow-auth:master",

#   # 端口映射（可选）
#   # "PORTS": ["80:80", "3302:3302"],

#   # 环境变量（可选）
#   # "ENV": {
#   #   "KEY": "123"
#   # },

#   # 卷映射（可选）
#   # 默认添加/etc/hosts:/etc/hosts和./config:/etc/scow
#   # 可选添加其他映射
#   # "VOLUMES": {
#   #   "./test.py": "/etc/test.py"  ,
#   # }
# }

#
# ------ 调试模式 ---------
# DEBUG = {
#   # # 将一些内部服务的端口映射到localhost
#   # "OPEN_PORTS": {
#   #   # 数据库的3306端口映射到...
#   #   "DB": 3308,
#   #
#   #   # redis的6379端口映射到...
#   #   "REDIS": 6379,
#   #
#   #   # mis-server的5000端口映射到...
#   #   "MIS_SERVER": 7571,
#   #
#   #   # portal-server的5000端口映射到...
#   #   "PORTAL_SERVER": 7572,
#   #
#   #   # 认证系统的5000端口映射到...
#   #   # 对自定义认证系统无效
#   #   "AUTH": 7575,
#   # }
# }
