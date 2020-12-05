import React, { useCallback, useLayoutEffect, useState } from 'react';
import debounce from 'lodash/debounce';

interface Size {
  width: number;
  height: number;
}
const querySize = (el?: Element | null): Size => {
  if (!el) {
    return {
      width: 0,
      height: 0,
    };
  }

  const { width, height } = el.getBoundingClientRect();
  return {
    width,
    height,
  };
};

const useSize = (ref: React.RefObject<Element>) => {
  const [size, setSize] = useState(querySize(ref ? ref.current : undefined));

  const handleResize = useCallback(
    debounce(() => {
      if (ref.current) {
        setSize(querySize(ref.current));
      }
    }, 0),
    [ref.current],
  );

  useLayoutEffect(() => {
    if (!ref.current) return;

    handleResize();
    window.addEventListener('resize', handleResize);

    return function () {
      window.removeEventListener('resize', handleResize);
    };
  }, [ref.current]);

  return size;
};

export default useSize;
