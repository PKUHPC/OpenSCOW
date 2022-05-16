---
sidebar_position: 1
title: 自定义前端相对路径 
---

# 自定义前端相对路径

对于[门户系统前端](../../portal/deployment/web.mdx)和[管理系统前端](../../mis/deployment/web.md)项目，我们提供部署在根路径(`/`)和一个子路径（`/mis`和`/portal`）的镜像。如果想把前端部署在其他相对路径，需要重新编译项目，操作如下：

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
docker build -f dockerfiles/Dockerfile.mis-web --build-arg BASE_PATH="部署时的相对路径" -t "镜像tag" .

# 门户系统
docker build -f dockerfiles/Dockerfile.portal-web --build-arg BASE_PATH="部署时的相对路径" -t "镜像tag" .
```

4. 构建完成后，部署构建时的`镜像tag`的镜像即可