// src/hooks/useCleanup.ts
import { useEffect, useRef, useCallback } from "react";

interface CleanupManager {
  addCleanup: (cleanup: () => void) => void;
  removeCleanup: (cleanup: () => void) => void;
  clearAll: () => void;
}

/**
 * 컴포넌트 언마운트 시 정리 작업을 관리하는 훅
 * 메모리 누수를 방지하고 성능을 최적화합니다.
 */
export const useCleanup = (): CleanupManager => {
  const cleanupsRef = useRef<Set<() => void>>(new Set());
  const isMountedRef = useRef(true);

  // 정리 함수 추가
  const addCleanup = useCallback((cleanup: () => void) => {
    if (isMountedRef.current) {
      cleanupsRef.current.add(cleanup);
    }
  }, []);

  // 정리 함수 제거
  const removeCleanup = useCallback((cleanup: () => void) => {
    cleanupsRef.current.delete(cleanup);
  }, []);

  // 모든 정리 함수 실행
  const clearAll = useCallback(() => {
    cleanupsRef.current.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    });
    cleanupsRef.current.clear();
  }, []);

  // 컴포넌트 언마운트 시 모든 정리 작업 실행
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearAll();
    };
  }, [clearAll]);

  return { addCleanup, removeCleanup, clearAll };
};

/**
 * 타이머 관리를 위한 훅
 * setTimeout, setInterval을 자동으로 정리합니다.
 */
export const useTimer = () => {
  const cleanup = useCleanup();
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const setTimeout = useCallback(
    (callback: () => void, delay: number) => {
      const timer = global.setTimeout(() => {
        timersRef.current.delete(timer);
        callback();
      }, delay);

      timersRef.current.add(timer);
      cleanup.addCleanup(() => {
        global.clearTimeout(timer);
        timersRef.current.delete(timer);
      });

      return timer;
    },
    [cleanup]
  );

  const setInterval = useCallback(
    (callback: () => void, delay: number) => {
      const timer = global.setInterval(callback, delay);

      timersRef.current.add(timer);
      cleanup.addCleanup(() => {
        global.clearInterval(timer);
        timersRef.current.delete(timer);
      });

      return timer;
    },
    [cleanup]
  );

  const clearTimeout = useCallback((timer: NodeJS.Timeout) => {
    global.clearTimeout(timer);
    timersRef.current.delete(timer);
  }, []);

  const clearInterval = useCallback((timer: NodeJS.Timeout) => {
    global.clearInterval(timer);
    timersRef.current.delete(timer);
  }, []);

  return { setTimeout, setInterval, clearTimeout, clearInterval };
};

/**
 * React Native용 이벤트 리스너 관리 훅
 * 컴포넌트 언마운트 시 이벤트 리스너를 자동으로 정리합니다.
 * 
 * @param eventName - 이벤트 이름
 * @param handler - 이벤트 핸들러 함수
 * @param target - 이벤트 대상 객체 (선택사항)
 */
export const useEventListener = <T = any>(
  eventName: string,
  handler: (event: T) => void,
  target?: any
) => {
  const cleanup = useCleanup();
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!target) return;

    const eventListener = (event: T) => savedHandler.current(event);

    // React Native에서는 addEventListener 대신 컴포넌트별 이벤트 처리
    if (target?.addEventListener) {
      target.addEventListener(eventName, eventListener);
      cleanup.addCleanup(() => {
        target.removeEventListener?.(eventName, eventListener);
      });

      return () => {
        target.removeEventListener?.(eventName, eventListener);
      };
    }
  }, [eventName, target, cleanup]);
};

/**
 * 비동기 작업 관리를 위한 훅
 * 컴포넌트 언마운트 시 진행 중인 작업을 취소합니다.
 */
export const useAsyncCleanup = () => {
  const cleanup = useCleanup();
  const abortControllersRef = useRef<Set<AbortController>>(new Set());
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const createAbortController = useCallback(() => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);

    cleanup.addCleanup(() => {
      controller.abort();
      abortControllersRef.current.delete(controller);
    });

    return controller;
  }, [cleanup]);

  const isMounted = useCallback(() => isMountedRef.current, []);

  const runAsync = useCallback(
    async <T>(
      asyncFunction: (signal: AbortSignal) => Promise<T>
    ): Promise<T | null> => {
      const controller = createAbortController();

      try {
        const result = await asyncFunction(controller.signal);
        if (!isMounted()) {
          return null;
        }
        return result;
      } catch (error: any) {
        if (error.name === "AbortError") {
          return null;
        }
        throw error;
      } finally {
        abortControllersRef.current.delete(controller);
      }
    },
    [createAbortController, isMounted]
  );

  return { runAsync, isMounted, createAbortController };
};

// 사용 예시:
/*
const MyComponent = () => {
  const timer = useTimer();
  const { runAsync } = useAsyncCleanup();

  useEffect(() => {
    // 타이머 설정 - 자동으로 정리됨
    timer.setTimeout(() => {
      console.log('Timer fired');
    }, 1000);

    // 비동기 작업 - 자동으로 취소됨
    runAsync(async (signal) => {
      const response = await fetch('/api/data', { signal });
      return response.json();
    }).then(data => {
      if (data) {
        // 컴포넌트가 마운트된 상태에서만 실행
        setState(data);
      }
    });
  }, []);

  return <View>...</View>;
};
*/
