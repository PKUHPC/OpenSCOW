---
sidebar_position: 1
title: 相对路径
---

# 自定义相对路径

## 什么是相对路径（base path）

假设我们的系统部署在`https://scowtest.com`下，那么在浏览器中输入此URL，即可访问系统。在这种部署条件下，我们说，系统部署在`scowtest.com`域名下，其相对于域名的路径（相对路径）为根路径，即`/`。

在一些特殊条件下，我们想使用同一个域名部署多个系统，每个系统部署在一个域名的某个**相对路径(base path)**下，例如，我们可能想通过`https://scowtest.com/scow`访问系统。在这种条件下，系统仍然部署在`scowtest.com`域名下，但是其**相对路径**为`/scow`。

## 需重新构建镜像

当前由于技术限制，将系统部署不同的相对路径下需要重新编译前端项目的镜像以及进行一些配置。

### 方法1：从源码构建时配置整个系统的相对路径

您可以使用以下命令构建整个系统的所有镜像。

```bash
docker compose --env-file dev/.env.build -f dev/docker-compose.build.yml build 
```

构建完成后，将会生成以下四个镜像：

| 系统 | 镜像（不包括IMAGE_BASE部分） | 相对路径  |
| ---- | ---------------------------- | --------- |
| 门户 | `portal-web-root`            | `/`       |
| 门户 | `portal-web-portal`          | `/portal` |
| 管理 | `mis-web-root`               | `/`       |
| 管理 | `mis-web-mis`                | `/mis`    |

如果您选择此方法从源码构建所有镜像，并且您只需要在已经提供的相对路径（`/`、`/portal`和`/mis`）前面加上一段路径，您可以

- 在运行此`docker compose build`命令时通过Shell传入`BASE_PATH`环境变量
- 在构建前修改`dev/.env.build`中的`BASE_PATH`变量

假设整个系统在`/demo`下，门户系统运行在`/demo`下，管理系统在`/demo/mis`下。
 
将`dev/.env.build`中的`BASE_PATH`修改为`/demo`，或者运行

```sh
BASE_PATH=/demo docker compose --env-file dev/.env.build -f dev/docker-compose.build.yml build 
```

系统构建的web镜像为以下四个：

| 系统 | 镜像（不包括IMAGE_BASE部分） | 相对路径       |
| ---- | ---------------------------- | -------------- |
| 门户 | `portal-web-root`            | `/demo`        |
| 门户 | `portal-web-portal`          | `/demo/portal` |
| 管理 | `mis-web-root`               | `/demo`        |
| 管理 | `mis-web-mis`                | `/demo/mis`    |

如果使用这种方法，构建好镜像后，`config.py`中的修改如下。

```python
# 整个系统的根路径
COMMON = {
  "BASE_PATH": "/demo",
  # ...
}

# 已经部署的门户系统
# 门户系统部署在/demo下，相对于COMMON.BASE_PATH是根路径，所以设置PORTAL.BASE_PATH为/
# PORTAL.BASE_PATH若不设置，默认值为/
# 门户系统对应此基础路径的镜像为portal-web-root，所以PORTAL.IMAGE_POSTFIX取root
PORTAL = {
  "BASE_PATH": "/",
  "IMAGE_POSTFIX": "root"
}


# 已经部署的管理系统
# 管理系统部署在/demo/mis下，相对于COMMON.BASE_PATH为/mis，所以设置MIS.BASE_PATH为/scow-mis
# 管理系统对应此基础路径的镜像的是mis-web-mis，所以MIS.IMAGE_POSTFIX取mis
MIS = {
  "BASE_PATH": "/mis",
  "IMAGE_POSTFIX": "mis",
  # ...
}

```

### 方法2：更灵活地自定义路径

如果您想要更灵活地自定义相对路径，请参考以下方案：

我们假设整个系统部署在`/demo1`之下，门户在`/demo1`根目录下，管理系统在`/demo1/scow-mis`下，`config.py`中的`COMMON.IMAGE_BASE`为`%CR_URL%`，`COMMON.IMAGE_TAG`为`master`。

这种情况操作如下：

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
docker build -f dockerfiles/Dockerfile.mis-web --build-arg BASE_PATH="/demo1/scow-mis" -t "%CR_URL%/mis-web-mis1:master" .

# 门户系统
docker build -f dockerfiles/Dockerfile.portal-web --build-arg BASE_PATH="/demo1" -t "%CR_URL%/portal-web-portal1:master" .
```

4. 构建完成后，修改`config.py`

```python
# 具体注释请参考config.py中的备注

# 整个系统的根路径
COMMON = {
  "BASE_PATH": "/demo1",
  # ...
}

# 已经部署的门户系统
# 门户系统部署在/demo1下，相对于COMMON.BASE_PATH是根路径，所以设置PORTAL.BASE_PATH为/
# PORTAL.BASE_PATH若不设置，默认值为/
# 门户系统的镜像是portal-web-{portal1}，所以PORTAL.IMAGE_POSTFIX取portal1
PORTAL = {
  "BASE_PATH": "/",
  "IMAGE_POSTFIX": "portal1"
}


# 已经部署的管理系统
# 管理系统部署在/demo1/scow-mis下，相对于COMMON.BASE_PATH为/scow-mis，所以设置MIS.BASE_PATH为/scow-mis
# 管理系统的镜像的是mis-web-{mis1}，所以MIS.IMAGE_POSTFIX取mis1
MIS = {
  "BASE_PATH": "/scow-mis",
  "IMAGE_POSTFIX": "mis1",
  # ...
}

```

## `config.py`中`BASE_PATH`填写规则

`config.py`中，`COMMON.BASE_PATH`、`PORTAL.BASE_PATH`和`MIS.BASE_PATH`均不以`/`结尾。`COMMON.BASE_PATH`填写整个系统的根路径，`PORTAL.BASE_PATH`和`MIS.BASE_PATH`分别表示门户系统和管理系统相对于系统的相对路径，遵循以下的编写原则：

| 整个系统的访问路径 | 门户系统的访问路径 | 管理系统的访问路径 | `COMMON.BASE_PATH` | `PORTAL.BASE_PATH` | `MIS.BASE_PATH` |
| ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | --------------- |
| /                  | /                  | /mis               | /                  | /                  | /mis            |
| /                  | /portal            | /                  | /                  | /portal            | /               |
| /scow              | /scow              | /scow/mis          | /scow              | /                  | /mis            |
| /scow              | /scow/portal       | /scow              | /scow              | /portal            | /               |
