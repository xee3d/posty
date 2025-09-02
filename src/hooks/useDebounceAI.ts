// hooks/useDebounceAI.ts
import { useRef, useCallback } from "react";

interface DebounceOptions {
  delay?: number;
  onPending?: () => void;
  onComplete?: () => void;
}

export const useDebounceAI = (
  callback: Function,
  options: DebounceOptions = {}
) => {
  const { delay = 1000, onPending, onComplete } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef(false);

  const debouncedFunction = useCallback(
    (...args: any[]) => {
      // 이미 대기 중인 요청이 있으면 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 대기 상태 표시
      if (!pendingRef.current && onPending) {
        pendingRef.current = true;
        onPending();
      }

      // 새로운 타임아웃 설정
      timeoutRef.current = setTimeout(async () => {
        try {
          await callback(...args);
        } finally {
          pendingRef.current = false;
          if (onComplete) {
            onComplete();
          }
        }
      }, delay);
    },
    [callback, delay, onPending, onComplete]
  );

  // 즉시 실행 함수 (긴급한 경우)
  const executeNow = useCallback(
    async (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      pendingRef.current = false;
      await callback(...args);
    },
    [callback]
  );

  // 대기 중인 요청 취소
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      pendingRef.current = false;
    }
  }, []);

  return {
    debouncedFunction,
    executeNow,
    cancel,
    isPending: pendingRef.current,
  };
};
