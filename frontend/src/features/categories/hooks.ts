import { useQuery } from "@tanstack/react-query";

import { getCategories } from "@/services/api/catalog.api";
import { queryKeys } from "@/services/query/keys";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });
}
