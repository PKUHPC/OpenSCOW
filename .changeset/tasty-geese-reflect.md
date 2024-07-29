---
"@scow/lib-web": patch
---

如果UI扩展自定义导航栏接口返回的某个导航项的`path`与某个已有的路径的`clickToPath`相同（之前只检查`path`），则返回的路径也将不做进一步处理
