import { useEffect, useState, useRef } from 'react';

const useDebounce = <T>(value: T, delay: number): T => {
  const [debounceValue, setDebounceValue] = useState(value);
  const timeRef = useRef<number | null>(null);
  useEffect(() => {
    if (timeRef.current) {
      clearTimeout(timeRef.current);
    }
    timeRef.current = window.setTimeout(() => {
      setDebounceValue(value);
    }, delay);

    return () => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
    };
  }, [value, delay]);

  return debounceValue;
};

export default useDebounce;
