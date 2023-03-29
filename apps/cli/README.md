# scow-cli

## 更新

`scow-cli`可以自我更新

```bash
# 更新到PR 535对应的最新的版本
./cli update --pr 535

# 更新到test分支的最新cli版本
./cli update --branch test

# 将test分支的最新cli下载到./cli-test
./cli update --pr 535 -o ./cli-test
```

使用PR或者branch选项需要您创建一个有workflow权限的GitHub Token (https://github.com/settings/tokens/new)，并将这个token放到cli目录下的.env文件

```env
# .env
GITHUB_TOKEN=你的token
```

## 打印调试日志

```bash
DEBUG="scow:cli" ./cli
```