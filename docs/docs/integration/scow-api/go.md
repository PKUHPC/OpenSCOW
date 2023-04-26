---
sidebar_position: 2
title: Go客户端示例
---

# Go示例

示例项目：https://github.com/PKUHPC/scow-grpc-api-go-client-demo

1. 安装Buf CLI（[官网文档](https://buf.build/docs/installation/)）
2. 初始化一个Go项目，假设模块名为`github.com/PKUHPC/scow-grpc-client-demo`
  
```bash
go mod init github.com/PKUHPC/scow-grpc-api-client-demo
```

3. 创建`buf.gen.yaml`文件，内容如下：

```yaml title="buf.gen.yaml"
version: v1
managed:
  enabled: true
  go_package_prefix:
    # 项目模块名+生成路径（plugins中out）
    default: github.com/PKUHPC/scow-grpc-api-client-demo/gen/go
    except:
        - buf.build/googleapis/googleapis
plugins:
  - plugin: buf.build/protocolbuffers/go
    out: gen/go
    opt: paths=source_relative
  - plugin: buf.build/grpc/go
    out: gen/go
    opt: paths=source_relative,require_unimplemented_servers=false

```

4. 根据某个具体SCOW版本生成代码

```bash
# 通过#后的参数确认SCOW版本，可输入分支（branch=master）, SCOW Tag号（tag=v0.4.0）
# 不写默认使用SCOW的master分支版本
buf generate --template buf.gen.yaml https://github.com/PKUHPC/SCOW.git#subdir=protos,branch=master
```

5. 编写Go代码

```go title="main.go"
package main

import (
	"context"
	"log"

	"github.com/PKUHPC/scow-grpc-api-client-demo/gen/go/server"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	conn, err := grpc.Dial("192.168.88.100:7571", grpc.WithTransportCredentials(insecure.NewCredentials()))

  if err != nil {
    panic(err)
  }

	client := server.NewAccountServiceClient(conn)

	resp, err := client.GetAccounts(context.Background(), &server.GetAccountsRequest{})

	if err != nil {
		panic(err)
	}

	log.Printf("Account list: %v", resp)
}
```

6. 下载依赖并运行

```bash
go mod tidy
go run main.go
```