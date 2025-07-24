import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for localStorage management with serialization and error handling
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if no stored value exists
 * @param {Object} options - Configuration options
 * @returns {[value, setValue, remove, isLoading, error]}
 */
export function useLocalStorage(key, defaultValue = null, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = console.error,
    syncAcrossTabs = false
  } = options;

  const [storedValue, setStoredValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Keep track of the current key
  const currentKey = useRef(key);

  // Function to get value from localStorage
  const getValue = useCallback(() => {
    try {
      setError(null);
      
      if (typeof window === 'undefined') {
        return defaultValue;
      }

      const item = window.localStorage.getItem(key);
      
      if (item === null) {
        return defaultValue;
      }

      return deserialize(item);
    } catch (err) {
      setError(err);
      onError(err);
      return defaultValue;
    }
  }, [key, defaultValue, deserialize, onError]);

  // Function to set value in localStorage
  const setValue = useCallback((value) => {
    try {
      setError(null);
      
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        if (valueToStore === undefined || valueToStore === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, serialize(valueToStore));
        }
      }
    } catch (err) {
      setError(err);
      onError(err);
    }
  }, [key, storedValue, serialize, onError]);

  // Function to remove value from localStorage
  const remove = useCallback(() => {
    try {
      setError(null);
      setStoredValue(defaultValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      setError(err);
      onError(err);
    }
  }, [key, defaultValue, onError]);

  // Function to check if key exists
  const exists = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(key) !== null;
  }, [key]);

  // Initialize value on mount or when key changes
  useEffect(() => {
    setIsLoading(true);
    
    const initialValue = getValue();
    setStoredValue(initialValue);
    setIsLoading(false);
    
    currentKey.current = key;
  }, [key, getValue]);

  // Listen for storage changes across tabs (if enabled)
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.storageArea === window.localStorage) {
        try {
          const newValue = e.newValue ? deserialize(e.newValue) : defaultValue;
          setStoredValue(newValue);
        } catch (err) {
          setError(err);
          onError(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue, deserialize, onError, syncAcrossTabs]);

  return [storedValue, setValue, remove, isLoading, error, exists];
}

/**
 * Hook for managing localStorage with automatic JSON serialization
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value
 * @returns {[value, setValue, remove, isLoading, error]}
 */
export function useLocalStorageState(key, defaultValue = null) {
  return useLocalStorage(key, defaultValue, {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    syncAcrossTabs: true
  });
}

/**
 * Hook for managing localStorage with string values only
 * @param {string} key - The localStorage key
 * @param {string} defaultValue - Default value
 * @returns {[value, setValue, remove, isLoading, error]}
 */
export function useLocalStorageString(key, defaultValue = '') {
  return useLocalStorage(key, defaultValue, {
    serialize: (value) => value,
    deserialize: (value) => value
  });
}

/**
 * Hook for managing localStorage with boolean values
 * @param {string} key - The localStorage key
 * @param {boolean} defaultValue - Default value
 * @returns {[value, setValue, remove, isLoading, error]}
 */
export function useLocalStorageBoolean(key, defaultValue = false) {
  return useLocalStorage(key, defaultValue, {
    serialize: (value) => String(value),
    deserialize: (value) => value === 'true'
  });
}

/**
 * Hook for managing localStorage with number values
 * @param {string} key - The localStorage key
 * @param {number} defaultValue - Default value
 * @returns {[value, setValue, remove, isLoading, error]}
 */
export function useLocalStorageNumber(key, defaultValue = 0) {
  return useLocalStorage(key, defaultValue, {
    serialize: (value) => String(value),
    deserialize: (value) => Number(value)
  });
}

/**
 * Hook for managing arrays in localStorage
 * @param {string} key - The localStorage key
 * @param {Array} defaultValue - Default array value
 * @returns {[array, setArray, addItem, removeItem, clear, isLoading, error]}
 */
export function useLocalStorageArray(key, defaultValue = []) {
  const [array, setArray, remove, isLoading, error] = useLocalStorage(key, defaultValue);

  const addItem = useCallback((item) => {
    setArray(currentArray => [...currentArray, item]);
  }, [setArray]);

  const removeItem = useCallback((indexOrPredicate) => {
    setArray(currentArray => {
      if (typeof indexOrPredicate === 'number') {
        return currentArray.filter((_, index) => index !== indexOrPredicate);
      } else if (typeof indexOrPredicate === 'function') {
        return currentArray.filter((item, index) => !indexOrPredicate(item, index));
      }
      return currentArray;
    });
  }, [setArray]);

  const updateItem = useCallback((indexOrPredicate, newItem) => {
    setArray(currentArray => {
      return currentArray.map((item, index) => {
        if (typeof indexOrPredicate === 'number') {
          return index === indexOrPredicate ? newItem : item;
        } else if (typeof indexOrPredicate === 'function') {
          return indexOrPredicate(item, index) ? newItem : item;
        }
        return item;
      });
    });
  }, [setArray]);

  const clear = useCallback(() => {
    setArray([]);
  }, [setArray]);

  const insertAt = useCallback((index, item) => {
    setArray(currentArray => {
      const newArray = [...currentArray];
      newArray.splice(index, 0, item);
      return newArray;
    });
  }, [setArray]);

  const moveItem = useCallback((fromIndex, toIndex) => {
    setArray(currentArray => {
      const newArray = [...currentArray];
      const [movedItem] = newArray.splice(fromIndex, 1);
      newArray.splice(toIndex, 0, movedItem);
      return newArray;
    });
  }, [setArray]);

  return {
    array,
    setArray,
    addItem,
    removeItem,
    updateItem,
    clear,
    insertAt,
    moveItem,
    remove,
    isLoading,
    error
  };
}

/**
 * Hook for managing objects in localStorage
 * @param {string} key - The localStorage key
 * @param {Object} defaultValue - Default object value
 * @returns {[object, setObject, updateProperty, removeProperty, clear, isLoading, error]}
 */
export function useLocalStorageObject(key, defaultValue = {}) {
  const [object, setObject, remove, isLoading, error] = useLocalStorage(key, defaultValue);

  const updateProperty = useCallback((property, value) => {
    setObject(currentObject => ({
      ...currentObject,
      [property]: value
    }));
  }, [setObject]);

  const removeProperty = useCallback((property) => {
    setObject(currentObject => {
      const { [property]: removed, ...rest } = currentObject;
      return rest;
    });
  }, [setObject]);

  const clear = useCallback(() => {
    setObject({});
  }, [setObject]);

  const merge = useCallback((newProperties) => {
    setObject(currentObject => ({
      ...currentObject,
      ...newProperties
    }));
  }, [setObject]);

  return {
    object,
    setObject,
    updateProperty,
    removeProperty,
    clear,
    merge,
    remove,
    isLoading,
    error
  };
}

/**
 * Hook for managing localStorage with compression
 * Useful for large data that you want to compress before storing
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value
 * @returns {[value, setValue, remove, isLoading, error]}
 */
export function useLocalStorageCompressed(key, defaultValue = null) {
  // Simple compression using base64 encoding
  // In a real application, you might want to use a proper compression library
  const compress = useCallback((data) => {
    try {
      return btoa(JSON.stringify(data));
    } catch {
      return JSON.stringify(data);
    }
  }, []);

  const decompress = useCallback((data) => {
    try {
      return JSON.parse(atob(data));
    } catch {
      return JSON.parse(data);
    }
  }, []);

  return useLocalStorage(key, defaultValue, {
    serialize: compress,
    deserialize: decompress
  });
}

/**
 * Hook for managing localStorage with expiration
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value
 * @param {number} expirationTime - Time in milliseconds after which the value expires
 * @returns {[value, setValue, remove, isLoading, error, isExpired]}
 */
export function useLocalStorageWithExpiration(key, defaultValue = null, expirationTime = 24 * 60 * 60 * 1000) {
  const serialize = useCallback((value) => {
    return JSON.stringify({
      value,
      timestamp: Date.now(),
      expirationTime
    });
  }, [expirationTime]);

  const deserialize = useCallback((data) => {
    const parsed = JSON.parse(data);
    const { value, timestamp, expirationTime: storedExpirationTime } = parsed;
    
    const isExpired = Date.now() - timestamp > storedExpirationTime;
    
    if (isExpired) {
      throw new Error('Data expired');
    }
    
    return value;
  }, []);

  const [storedValue, setValue, remove, isLoading, error] = useLocalStorage(key, defaultValue, {
    serialize,
    deserialize,
    onError: (err) => {
      if (err.message === 'Data expired') {
        // Silently remove expired data
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      }
    }
  });

  const checkExpiration = useCallback(() => {
    try {
      if (typeof window === 'undefined') return false;
      
      const item = window.localStorage.getItem(key);
      if (!item) return false;
      
      const parsed = JSON.parse(item);
      const { timestamp, expirationTime: storedExpirationTime } = parsed;
      
      return Date.now() - timestamp > storedExpirationTime;
    } catch {
      return false;
    }
  }, [key]);

  return [storedValue, setValue, remove, isLoading, error, checkExpiration];
}

/**
 * Hook for managing multiple localStorage keys as a single state object
 * @param {Object} keyMap - Object mapping state keys to localStorage keys
 * @param {Object} defaultValues - Default values for each key
 * @returns {[state, setState, clearAll, isLoading, errors]}
 */
export function useMultipleLocalStorage(keyMap, defaultValues = {}) {
  const [state, setState] = useState(defaultValues);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Initialize all values
  useEffect(() => {
    const loadAllValues = async () => {
      const newState = {};
      const newErrors = {};

      for (const [stateKey, storageKey] of Object.entries(keyMap)) {
        try {
          const item = localStorage.getItem(storageKey);
          newState[stateKey] = item ? JSON.parse(item) : defaultValues[stateKey];
        } catch (error) {
          newErrors[stateKey] = error;
          newState[stateKey] = defaultValues[stateKey];
        }
      }

      setState(newState);
      setErrors(newErrors);
      setIsLoading(false);
    };

    loadAllValues();
  }, []);

  // Update function
  const updateState = useCallback((updates) => {
    setState(currentState => {
      const newState = { ...currentState, ...updates };
      
      // Save each updated key to localStorage
      Object.entries(updates).forEach(([stateKey, value]) => {
        const storageKey = keyMap[stateKey];
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(value));
          } catch (error) {
            setErrors(prev => ({ ...prev, [stateKey]: error }));
          }
        }
      });
      
      return newState;
    });
  }, [keyMap]);

  // Clear all function
  const clearAll = useCallback(() => {
    Object.values(keyMap).forEach(storageKey => {
      localStorage.removeItem(storageKey);
    });
    setState(defaultValues);
    setErrors({});
  }, [keyMap, defaultValues]);

  return [state, updateState, clearAll, isLoading, errors];
}