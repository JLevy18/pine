export function throttle<T extends (...args: any[]) => any>(func: T, limit: number) {
    let lastFunc: number;
    let lastRan: number;
    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
      if (!lastRan) {
        func.apply(this, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = window.setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    } as T;
  }