import { useState, useCallback, useEffect, useRef } from 'react';

const MIN_LEFT = 180;
const MAX_LEFT = 400;
const MIN_RIGHT = 300;
const MAX_RIGHT = 600;
const MIN_CENTER = 200;

export const useResize = () => {
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(380);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const leftRef = useRef(leftWidth);
  const rightRef = useRef(rightWidth);
  leftRef.current = leftWidth;
  rightRef.current = rightWidth;

  useEffect(() => {
    const onWindowResize = () => {
      const total = window.innerWidth;
      const maxForSides = total - MIN_CENTER;
      const left = leftRef.current;
      const right = rightRef.current;
      if (left + right <= maxForSides) return;
      let newLeft = Math.min(MAX_LEFT, Math.max(MIN_LEFT, left));
      let newRight = Math.min(MAX_RIGHT, Math.max(MIN_RIGHT, right));
      if (newLeft + newRight > maxForSides) {
        const half = maxForSides / 2;
        newLeft = Math.min(MAX_LEFT, Math.max(MIN_LEFT, half));
        newRight = Math.min(MAX_RIGHT, Math.max(MIN_RIGHT, maxForSides - newLeft));
      }
      setLeftWidth(newLeft);
      setRightWidth(newRight);
    };
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isResizingLeft) {
        const newWidth = e.clientX;
        if (newWidth >= MIN_LEFT && newWidth <= MAX_LEFT) {
          setLeftWidth(newWidth);
        }
      }
      if (isResizingRight) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= MIN_RIGHT && newWidth <= MAX_RIGHT) {
          setRightWidth(newWidth);
        }
      }
    },
    [isResizingLeft, isResizingRight]
  );

  useEffect(() => {
    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  const startResizingLeft = () => {
    setIsResizingLeft(true);
  };

  const startResizingRight = () => {
    setIsResizingRight(true);
  };

  return {
    leftWidth,
    rightWidth,
    startResizingLeft,
    startResizingRight,
  };
};

