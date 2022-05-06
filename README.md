# SCOW

Super Computing On Web

# Repo结构

monorepo结构，一个repo包含了整个系统的所有代码和文档。

其中：

- `protos`：包含了整个系统所有的proto文件
- `dockerfiles`：包含整个系统所有的dockerfile文件
- `docker-compose.yml`：用来快速build每个子系统，不应该用来运行子系统
- `apps`：所有子系统
- `libs`：公共库
- `docs`：文档项目

# 开发

项目使用[`volta`](https://volta.sh/)管理node版本。安装好volta之后，无需手动安装node或者npm。volta将会在第一次运行npm或者node命令时自动安装对应工具的对应版本。

项目使用[`pnpm`](https://pnpm.io/)进行依赖管理。访问pnpm的网站安装pnpm，推荐standalone安装。

- npm workspace：
  - ~~这个会把所有依赖装在根目录，但是tsgrpc-cli会假设依赖装在项目目录，这样tsgrpc-cli就不能运行了~~（解决了）
  - npm workspace运行命令时不按依赖拓扑排序顺序运行（wtf!!!!），也不能手动在根package.json里指定所有包，因为每个子系统构建时，不存在其他子系统
- yarn workspace：新版本berry和volta的兼容性不好[issue](https://github.com/volta-cli/volta/issues/651)，yarn的workspaces的foreach命令需要单独装插件，而且foreach命令不会交互式地输出结果
- nx: 尝试迁移过去好几次了，但是感觉概念有点太复杂了……
- lerna: 很久没更新了，删除依赖需要删掉包的node_modules然后重新bootstrap，麻烦

要开始开发：

```bash
# 如果是standalone安装，或者在pnpm i的时候遇到node-gyp ENOET错误，运行以下全局安装node-gyp
pnpm install -g node-gyp

# 在根目录下，安装依赖
pnpm i

# 构建一次所有包，生成所有的proto文件以及依赖文件
pnpm run build
```

# 容器构建说明

- 每个子系统的Dockerfile都应该放在dockerfiles目录下
- 每个Dockerfile的context都应该是.，记得复制proto目录和依赖的本地库
- 所有根据proto生成的文件都应该被gitignore和dockerignore，在容器中构建时需要现场生成
- 根目录的`docker-compose.yml`应该只用于容器构建

# CI

所有往master分支的commit都会触发CI。CI会构建所有组件，把组件push到registry中，然后触发测试集群的部署。

如果commit的commit message中包含`[no deploy]`，那么CI会进行构建和push到镜像，但是不会触发部署。