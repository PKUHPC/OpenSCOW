// 判断对象是否为空
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
