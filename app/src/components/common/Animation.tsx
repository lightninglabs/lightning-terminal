import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface Props {
  className?: string;
  animationData: any;
}

const Animation: React.FC<Props> = ({ className, animationData }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
    });
  }, [animationData]);

  return <div ref={containerRef} className={className} />;
};

export default Animation;
