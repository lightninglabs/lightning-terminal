import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface Props {
  className?: string;
  animationData: any;
  loop?: boolean;
}

const Animation: React.FC<Props> = ({ className, animationData, loop = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay: true,
      animationData,
    });
  }, [animationData, loop]);

  return <div ref={containerRef} className={className} />;
};

export default Animation;
