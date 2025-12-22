import { useState, useEffect } from 'react';

type LocalStorageProps<T> = [T, (value: T) => void];

function useLocalStorage<T>(key: string, initialValue: T): LocalStorageProps<T> {
  const [value, setValue] = useState<T>(() => {
    const jsonValue = localStorage.getItem(key);
    if (jsonValue !== null) {
      try {
        return JSON.parse(jsonValue) as T;
      } catch (e) {
        console.warn(`Failed to parse localStorage item with key "${key}"`, e);
      }
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
