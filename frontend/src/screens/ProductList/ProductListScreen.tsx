import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/core/navigation/types";
import { getApiErrorMessage } from "@/services/api/client";
import type { FeaturedProduct } from "@/services/api/types";
import { useProducts } from "@/features/products/hooks";
import { ProductCard } from "@/screens/Home/ProductCard";
import { DEFAULT_FILTERS, FilterModal, activeFilterCount, priceRangeToBounds } from "./FilterModal";
import type { ProductFilters } from "./FilterModal";
import { SORT_LABELS, SortModal, sortOptionToParams } from "./SortModal";
import type { SortOption } from "./SortModal";

const PAGE_SIZE = 12;

type GenderTab = "ALL" | "WOMEN" | "MEN";

const GENDER_TABS: { key: GenderTab; label: string }[] = [
  { key: "ALL", label: "All Wigs" },
  { key: "WOMEN", label: "Women's Wigs" },
  { key: "MEN", label: "Men's Hair Systems" },
];

type Props = NativeStackScreenProps<RootStackParamList, "ProductList">;

export function ProductListScreen({ route, navigation }: Props) {
  const { categorySlug, categoryName, newArrival, bestSeller, featured, searchQuery } = route.params;

  const [genderTab, setGenderTab] = useState<GenderTab>("ALL");
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...DEFAULT_FILTERS,
    newArrival: newArrival ?? false,
    bestSeller: bestSeller ?? false,
    featured: featured ?? false,
  }));
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const queryParams = useMemo(
    () => ({
      category: categorySlug,
      gender: genderTab === "ALL" ? undefined : genderTab,
      ...priceRangeToBounds(filters.priceRange),
      newArrival: filters.newArrival || undefined,
      bestSeller: filters.bestSeller || undefined,
      featured: filters.featured || undefined,
      sale: filters.sale || undefined,
      texture: filters.texture,
      search: searchQuery || undefined,
      ...sortOptionToParams(sort),
      limit: PAGE_SIZE,
      page,
    }),
    [categorySlug, genderTab, filters, sort, page, searchQuery]
  );

  const productsQuery = useProducts(queryParams);

  useEffect(() => {
    setPage(1);
    setProducts([]);
  }, [categorySlug, genderTab, filters, sort, searchQuery]);

  useEffect(() => {
    if (!productsQuery.data) return;
    setProducts((prev) => (page === 1 ? productsQuery.data.products : [...prev, ...productsQuery.data.products]));
  }, [productsQuery.data, page]);

  const pagination = productsQuery.data?.pagination;
  const filterCount = activeFilterCount(filters);
  const hasResults = products.length > 0;
  const canLoadMore = Boolean(pagination && pagination.page < pagination.pages);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const headerTitle = useMemo(() => {
    if (searchQuery) return `Search: "${searchQuery}"`;
    if (categoryName) return categoryName;
    if (newArrival) return "New Arrivals";
    if (bestSeller) return "Best Sellers";
    if (featured) return "Featured Collection";
    return "All Wigs & Hair Systems";
  }, [categoryName, newArrival, bestSeller, featured, searchQuery]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color="#1F1233" />
          </Pressable>
          <Text style={styles.title}>{headerTitle}</Text>
          <Text style={styles.subtitle}>Premium quality wigs for men and women</Text>
        </View>

        <View style={styles.genderTabRow}>
          {GENDER_TABS.map((tab) => (
            <Pressable key={tab.key} onPress={() => setGenderTab(tab.key)} style={styles.genderTabButton}>
              <Text style={[styles.genderTabLabel, genderTab === tab.key && styles.genderTabLabelActive]}>
                {tab.label}
              </Text>
              {genderTab === tab.key ? <View style={styles.genderTabUnderline} /> : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.toolbar}>
          <Pressable onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
            <Ionicons name="options-outline" size={16} color="#1F1233" />
            <Text style={styles.filterButtonText}>Filters</Text>
            {filterCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            ) : null}
          </Pressable>

          {filterCount > 0 ? (
            <Pressable onPress={clearFilters} hitSlop={6}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </Pressable>
          ) : null}

          <View style={styles.toolbarSpacer} />

          <Pressable onPress={() => setSortModalVisible(true)} style={styles.sortButton}>
            <Text style={styles.sortButtonText}>{SORT_LABELS[sort]}</Text>
            <Ionicons name="chevron-down" size={14} color="#1F1233" />
          </Pressable>
        </View>

        <Text style={styles.productCount}>{pagination?.total ?? 0} products</Text>

        {productsQuery.isPending && page === 1 ? (
          <View style={styles.statusBox}>
            <ActivityIndicator color={colors.purple.DEFAULT} />
          </View>
        ) : productsQuery.isError ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              {getApiErrorMessage(productsQuery.error, "Could not load products.")}
            </Text>
            <Pressable onPress={() => productsQuery.refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : !hasResults ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search" size={40} color={colors.purple.light} />
            <Text style={styles.emptyTitle}>No products found</Text>
            {filterCount > 0 || genderTab !== "ALL" ? (
              <Pressable
                onPress={() => {
                  clearFilters();
                  setGenderTab("ALL");
                }}
                style={styles.applyButton}
              >
                <Text style={styles.applyButtonText}>Clear Filters</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => navigation.navigate("ProductDetail", { id: product.slug })}
                  onTryOnPress={() => navigation.navigate("Home", { screen: "TryOn", params: { productId: product.id } })}
                />
              ))}
            </View>

            {canLoadMore ? (
              <Pressable
                onPress={() => setPage((p) => p + 1)}
                disabled={productsQuery.isFetching}
                style={styles.loadMoreButton}
              >
                {productsQuery.isFetching ? (
                  <ActivityIndicator color={colors.purple.DEFAULT} />
                ) : (
                  <Text style={styles.loadMoreText}>Load More</Text>
                )}
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        initialFilters={filters}
        onApply={setFilters}
        onClose={() => setFilterModalVisible(false)}
      />

      <SortModal
        visible={sortModalVisible}
        selected={sort}
        onSelect={setSort}
        onClose={() => setSortModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: colors.purple.DEFAULT,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  genderTabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE4F6",
    gap: 20,
  },
  genderTabButton: {
    paddingBottom: 10,
  },
  genderTabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8A7B99",
  },
  genderTabLabelActive: {
    color: colors.purple.DEFAULT,
    fontWeight: "800",
  },
  genderTabUnderline: {
    height: 2,
    backgroundColor: colors.purple.DEFAULT,
    marginTop: 8,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  toolbarSpacer: {
    flex: 1,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5DAF2",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1233",
  },
  filterBadge: {
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.purple.DEFAULT,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F1233",
  },
  productCount: {
    fontSize: 13,
    color: "#8A7B99",
    paddingHorizontal: 20,
    marginTop: 14,
  },
  statusBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 40,
  },
  statusText: {
    fontSize: 13,
    color: "#5A4C6B",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryButton: {
    borderWidth: 1.5,
    borderColor: colors.purple.light,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryText: {
    color: colors.purple.DEFAULT,
    fontSize: 13,
    fontWeight: "700",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 56,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F1233",
  },
  applyButton: {
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 4,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  loadMoreButton: {
    alignSelf: "center",
    borderWidth: 1.5,
    borderColor: colors.purple.light,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 20,
  },
  loadMoreText: {
    color: colors.purple.DEFAULT,
    fontSize: 14,
    fontWeight: "700",
  },
});
