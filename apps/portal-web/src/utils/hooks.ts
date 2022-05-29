import { useEffect, useRef } from "react";

// https://stackoverflow.com/a/53180013

export const useDidUpdateEffect: typeof useEffect = (effect, deps) => {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current)
      return effect();
    else
      didMountRef.current = true;
  }, deps);
};
