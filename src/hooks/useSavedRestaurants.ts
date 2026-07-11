import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SavedRestaurantItem {
  id: number;
}

const QUERY_KEY = ["user", "me", "saved-restaurants"];

function hasToken(): boolean {
  return typeof localStorage !== "undefined" && !!localStorage.getItem("accessToken");
}

export function useSavedRestaurants(restaurantId?: string) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/users/me/saved-restaurants?size=200");
      const json = await res.json();
      return (json.data?.content ?? []) as SavedRestaurantItem[];
    },
    enabled: hasToken(),
    retry: false,
  });

  const saved = data ?? [];
  const savedIds = saved.map((r) => String(r.id));
  const isSaved = restaurantId ? savedIds.includes(restaurantId) : false;

  const toggleSave = async (id: string) => {
    if (!hasToken()) return;
    const currentlySaved = savedIds.includes(id);

    queryClient.setQueryData<SavedRestaurantItem[]>(QUERY_KEY, (old = []) =>
      currentlySaved
        ? old.filter((r) => String(r.id) !== id)
        : [...old, { id: Number(id) }]
    );

    try {
      await apiRequest(currentlySaved ? "DELETE" : "POST", `/api/v1/restaurants/${id}/save`);
    } catch {
      // 실패 시 서버 상태로 되돌림
    } finally {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
  };

  return {
    savedIds,
    isSaved,
    toggleSave,
  };
}
