---
"@scow/mis-web": patch
---

修复 Schema 中使用 Type.Union([Type.String(), Type.Undefined()])错误，改为 Type.Optional(Type.String())
