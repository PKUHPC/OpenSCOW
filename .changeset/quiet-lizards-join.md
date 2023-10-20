---
"@scow/grpc-api": patch
---

修改消费记录列表为后端分页，在获取消费记录的 getChargeRecords 接口中增加可选查询参数 page,pageSize,在 response 中增加 totalCount
