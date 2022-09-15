---
sidebar_position: 1
title: 相对路径 
---

# 自定义相对路径

## 什么是相对路径（base path）

假设我们的系统部署在`https://scowtest.com`下，那么在浏览器中输入此URL，即可访问系统。在这种部署条件下，我们说，系统部署在`scowtest.com`域名下，其相对于域名的路径（相对路径）为根路径，即`/`。

在一些特殊条件下，我们想使用同一个域名部署多个系统，每个系统部署在一个域名的某个**相对路径(base path)**下，例如，我们可能想通过`https://scowtest.com/scow`访问系统。在这种条件下，系统仍然部署在`scowtest.com`域名下，但是其**相对路径**为`/scow`。


## 部署系统于不同的相对路径下

当前由于技术限制，将系统部署不同的相对路径下需要重新编译前端项目的镜像以及进行一些配置。对于门户系统和管理系统，我们提供部署在根路径(`/`)和一个子路径（`/mis`和`/portal`）的镜像。

我们假设整个系统部署在`/demo1`之下，门户在`/demo1`根目录下，管理系统在`/demo1/mis`下，.env中的`IMAGE_BASE`为`%CR_URL%`，`IMAGE_TAG`为`master`。

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
docker build -f dockerfiles/Dockerfile.mis-web --build-arg BASE_PATH="/demo1/mis" -t "%CR_URL%/mis-web-mis1:master" .

# 门户系统
docker build -f dockerfiles/Dockerfile.portal-web --build-arg BASE_PATH="/demo1" -t "%CR_URL%/portal-web-portal1:master" .
```

4. 构建完成后，修改`.env`

```bash
# 具体注释请参考.env中的备注

# 整个系统的根路径
BASE_PATH=/demo1

# 已经部署的门户系统
PORTAL_DEPLOYED=true
# 门户系统的就是在/demo1下，相对于BASE_PATH是根路径，所以设置为/ 
PORTAL_BASE_PATH=/
# 门户系统的镜像的是portal-web-{portal1}，所以取portal1
PORTAL_IMAGE_POSTFIX=portal1

# 已经部署的门户系统
MIS_DEPLOYED=true
# 管理系统是再/demo1/mis下，相对于整个系统的路径为/mis
MIS_BASE_PATH=/mis
# 门户系统的镜像的是portal-web-{mis1}，所以取mis1
MIS_IMAGE_POSTFIX=mis1
```

## `BASE_PATH`填写规则

`.env`中，`BASE_PATH`、`PORTAL_BASE_PATH`和`MIS_BASE_PATH`均不以`/`结尾。`BASE_PATH`填写整个系统的根路径，`PORTAL_BASE_PATH`和`MIS_BASE_PATH`分别表示门户系统和管理系统相对于系统的相对路径，遵循以下的编写原则：

> 如果BASE_PATH为空（即根目录），那么
>   如果对应的系统部署在根目录下，填写`/`；否则填写相对路径，以`/`开头，不以`/`结尾
> 否则，即如果BASE_PATH不为空，那么
>   如果对应的系统部署在根目录下，不填写；否则填写相对路径，以`/`开头，不以`/`结尾

示例：

| 整个系统的访问路径 | 门户系统的访问路径 | 管理系统的访问路径 | `BASE_PATH` | `PORTAL_BASE_PATH` | `MIS_BASE_PATH` |
| ------------------ | ------------------ | ------------------ | ----------- | ------------------ | --------------- |
| /                  | /                  | /mis               |             | /                  | /mis            |
| /                  | /portal            | /                  |             | /portal            | /               |
| /scow              | /scow              | /scow/mis          | /scow       |                    | /mis            |
| /scow              | /scow/portal       | /scow              | /scow       | /portal            |                 |
