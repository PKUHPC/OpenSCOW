export function getEnumKeyByEnumValue<T extends Record<string, number | string>>(
  enumObj: T,
  enumValue: T[keyof T],
): string | undefined {
  const keys = Object.keys(enumObj).filter((k) => enumObj[k as keyof T] === enumValue);
  return keys.length > 0 ? keys[0] : undefined;
}
