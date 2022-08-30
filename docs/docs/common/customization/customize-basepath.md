---
sidebar_position: 1
title: 自定义前端相对路径 
---

# 自定义前端相对路径

对于门户系统和管理系统，根据部署的URL不同，我们提供部署在根路径(`/`)和一个子路径（`/mis`和`/portal`）的镜像。如果想把前端部署在其他相对路径，需要重新编译项目。

我们假设整个系统部署在`/demo1`之下，门户在`/demo1`根目录下，管理系统在`/demo1/mis`下。这种情况操作如下：

1. 确保操作机器中安装了以下安装了[docker](https://docs.docker.com/engine/install/)

2. 克隆仓库源码

```bash
git clone --depth=1 %REPO_URL%
```

3. 构建镜像

```bash
# 在项目根目录处运行
# BASE_PATH设置为部署时的相对路径，以/开头，不要以/结尾

# 管理系统
docker build -f dockerfiles/Dockerfile.mis-web --build-arg BASE_PATH="/demo1/mis" -t "mis-web-mis1" .

# 门户系统
docker build -f dockerfiles/Dockerfile.portal-web --build-arg BASE_PATH="/demo1" -t "portal-web-portal1" .
```

4. 构建完成后，修改`.env`

```env
# 整个系统的部署根路径，以/结尾
BASE_PATH=/demo1/

# 门户系统部署根路径，不包括BASE_PATH部分
PORTAL_BASE_PATH=/
# 门户系统镜像的最后部分，如portal1
PORTAL_IMAGE_POSTFIX=portal1

# 管理系统部署根目录，不包括BASE_PATH部分
MIS_BASE_PATH=/mis
# 管理系统镜像的最后部分，如mis11
MIS_IMAGE_POSTFIX=mis1
```