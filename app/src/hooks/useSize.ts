import React, { useCallback, useLayoutEffect, useState } from 'react';
import debounce from 'lodash/debounce';

interface Size {
  width: number;
  height: number;
}

/**
 * Queries the DOM to get an element's current dimensions
 * @param el a dome element
 */
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

/**
 * React Hook to return the width & height of a DOM element
 * @param ref a React ref of a DOM element
 */
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
