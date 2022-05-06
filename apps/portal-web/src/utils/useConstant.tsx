import { useState } from "react";

export default function useConstant<T>(func: () => T): T {
  const [value] = useState(func);

  return value;
}
