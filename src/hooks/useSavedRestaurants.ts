import { useSyncExternalStore, useCallback } from 'react';

const STORAGE_KEY = 'savedRestaurants';

// 구독자들에게 변경사항을 알리기 위한 이벤트 이미터
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

// 캐시된 스냅샷 (동일한 데이터일 때 동일한 참조 반환하여 불필요한 리렌더링 방지)
let cachedSnapshot: string[] | null = null;
let cachedSnapshotString: string | null = null;

// localStorage에서 데이터 읽기
function getSnapshot(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedString = saved || '[]';
    
    // 캐시된 값과 동일하면 동일한 참조 반환
    if (savedString === cachedSnapshotString && cachedSnapshot !== null) {
      return cachedSnapshot;
    }
    
    // 새로운 값 파싱 및 캐시
    cachedSnapshotString = savedString;
    cachedSnapshot = JSON.parse(savedString) as string[];
    return cachedSnapshot;
  } catch (error) {
    return [];
  }
}

// SSR을 위한 서버 사이드 스냅샷
function getServerSnapshot(): string[] {
  return [];
}

// 구독 함수
function subscribe(listener: Listener) {
  listeners.add(listener);
  
  // storage 이벤트 리스너는 한 번만 추가 (다른 탭/창에서의 변경사항 감지)
  if (listeners.size === 1) {
    window.addEventListener('storage', handleStorageChange);
  }
  
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorageChange);
    }
  };
}

function handleStorageChange(e: StorageEvent) {
  if (e.key === STORAGE_KEY) {
    notifyListeners();
  }
}

// 저장/삭제 토글
export function toggleSaveRestaurant(id: string) {
  try {
    const saved = getSnapshot();
    
    const updated = saved.includes(id)
      ? saved.filter((savedId) => savedId !== id)
      : [...saved, id];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // 캐시 무효화 - 다음 getSnapshot 호출 시 새로운 데이터 읽도록
    cachedSnapshot = null;
    cachedSnapshotString = null;
    
    notifyListeners(); // 같은 탭 내 변경사항 즉시 전파
  } catch (error) {
    // 에러 무시
  }
}

// 커스텀 훅
export function useSavedRestaurants(restaurantId?: string) {
  const savedIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  const isSaved = restaurantId ? savedIds.includes(restaurantId) : false;
  
  const toggleSave = useCallback((id: string) => {
    toggleSaveRestaurant(id);
  }, []);

  return {
    savedIds,
    isSaved,
    toggleSave,
  };
}
