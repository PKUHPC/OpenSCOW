---
sidebar_position: 1
title: 贡献指南
---

# 贡献指南

感谢您对参与OpenSCOW项目开发的兴趣！我们欢迎对项目有兴趣的参与者一起参与项目开发。

下图为为OpenSCOW贡献的流程图：

![贡献流程](process.png)

注意事项：

1. 对于来自fork的仓库的PR，仓库的CI将会对您的代码运行测试，但是不会构建镜像。为了方便您自己以及团队的测试工作，我们推荐您首先在您的仓库中，发起一个您的分支到您仓库的master分支的PR。这个过程的CI将会运行在您的仓库中，将会构建镜像并上传到您的仓库的GitHub Container Registry中，您以及我们团队可以使用这些镜像进行测试。

## 开源协议

OpenSCOW在[木兰宽松许可证，第2版 (MulanPSL-2.0)](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&ved=2ahUKEwir0N_4hPuIAxUinK8BHT7XBfIQFnoECBQQAQ&url=https%3A%2F%2Fspdx.org%2Flicenses%2FMulanPSL-2.0.html&usg=AOvVaw2pyvwh8sqZpV0XmHiRXQje&opi=89978449)下开源。您贡献的代码同样会在此协议下开源。

## RFC

OpenSCOW对于较大的修改采用**RFC流程**进行管理。若您想发起的修改较大（由您以及团队进行判断），您的修改须经过RFC流程。RFC流程如下：

1. 创建一个[RFC issue](https://github.com/PKUHPC/OpenSCOW/issues/new?assignees=&labels=rfc&projects=&template=rfc.yaml&title=%5BRFC%5D+mis%3A+Add+a+feature+for+management+of+cluster+resource+partition)，并尽量详细地填写
   1. 如果您已经创建了一个功能请求issue，请将此RFC issue与功能请求issue关联起来
2. 团队成员以及社区将会参与讨论，并确定主要的实现者
   1. 在讨论中，如果您需要修改RFC，请直接修改issue描述
   2. 只有您或者共同参与者可以修改issue描述
3. 当RFC讨论充分并稳定下来后，主要实现者将开始实现此功能，并发起PR
   1. 实现的PR应该与RFC issue关联起来
4. 团队成员将会进行审核，并决定是否合并修改

## 相关资料

- [开发](./dev.md): 帮助您搭建本地开发环境，运行代码和测试以及提交代码
