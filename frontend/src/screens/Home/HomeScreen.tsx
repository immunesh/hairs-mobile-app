import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import type { HomeTabScreenProps } from "@/core/navigation/types";
import {
  useBestSellers,
  useBlogPosts,
  useFeaturedProducts,
  useHeroSlides,
  useHomeCategories,
  useNewArrivals,
  useTestimonials,
} from "@/features/home/hooks";
import { resolveAssetUrl } from "@/services/api/client";
import { Header } from "./Header";
import { CategoryShortcuts } from "./CategoryShortcuts";
import { HeroSection, type HeroSlideView } from "./HeroSection";
import { CategorySection } from "./CategorySection";
import { FeaturedCollection } from "./FeaturedCollection";
import { NewArrivals } from "./NewArrivals";
import { BestSellers } from "./BestSellers";
import { Testimonials } from "./Testimonials";
import { BlogSection } from "./BlogSection";
import { NewsletterSection } from "./NewsletterSection";
import { TryOnPromo } from "./TryOnPromo";

const heroBackground = require("../../../assets/images/hero.png");

/** Shown until /hero-slides responds, and if no active slides are configured. */
const FALLBACK_HERO_SLIDES: Omit<HeroSlideView, "imageSource">[] = [
  {
    id: "fallback-1",
    badge: "PREMIUM HUMAN HAIR WIGS",
    headline: "Transform\nYour Look",
    subheadline: "Naturally ✨",
    description:
      "India's finest collection of 100% human hair wigs. Look stunning every day, effortlessly.",
    cta: "Shop Now",
    ctaSecondary: "Try On Virtually",
    accent: colors.purple.DEFAULT,
  },
  {
    id: "fallback-2",
    badge: "NEW ARRIVALS",
    headline: "Fresh Styles\nEvery Week",
    subheadline: "Curated for You ✨",
    description: "Discover the latest wig collections, handpicked for every texture and tone.",
    cta: "Explore Now",
    ctaSecondary: "Try On Virtually",
    accent: "#C2185B",
  },
  {
    id: "fallback-3",
    badge: "LIMITED TIME OFFER",
    headline: "Up To 30%\nOff Selected",
    subheadline: "Shop the Sale ✨",
    description: "Premium quality wigs at prices you'll love — while stocks last.",
    cta: "Grab the Deal",
    ctaSecondary: "Try On Virtually",
    accent: "#16A34A",
  },
];

const FEATURES = [
  { icon: "truck-fast-outline" as const, title: "Free Shipping", subtitle: "On orders above ₹999" },
  { icon: "backup-restore" as const, title: "7-Day Returns", subtitle: "Hassle-free returns" },
  { icon: "shield-check-outline" as const, title: "Genuine Products", subtitle: "100% authentic wigs" },
  { icon: "headset" as const, title: "Expert Support", subtitle: "Certified specialists" },
];

type Props = HomeTabScreenProps<"Home">;

export function HomeScreen({ navigation }: Props) {
  const heroSlidesQuery = useHeroSlides();
  const categoriesQuery = useHomeCategories();
  const featuredProductsQuery = useFeaturedProducts();
  const newArrivalsQuery = useNewArrivals();
  const bestSellersQuery = useBestSellers();
  const testimonialsQuery = useTestimonials();
  const blogPostsQuery = useBlogPosts();

  const apiSlides = heroSlidesQuery.data ?? [];
  const heroSlides: HeroSlideView[] =
    apiSlides.length > 0
      ? apiSlides.map((slide) => {
        const resolvedImage = resolveAssetUrl(slide.image);
        return {
          id: slide.id,
          badge: slide.badge ?? "PREMIUM HUMAN HAIR WIGS",
          headline: slide.headline,
          subheadline: slide.subheadline ?? "",
          description: slide.description ?? "",
          cta: slide.cta ?? "Shop Now",
          ctaSecondary: slide.ctaSecondary ?? "Try On Virtually",
          accent: slide.accent ?? colors.purple.DEFAULT,
          imageSource: resolvedImage ? { uri: resolvedImage } : heroBackground,
        };
      })
      : FALLBACK_HERO_SLIDES.map((slide) => ({ ...slide, imageSource: heroBackground }));

  const categories = categoriesQuery.data ?? [];
  const featuredProducts = featuredProductsQuery.data ?? [];
  const newArrivals = newArrivalsQuery.data ?? [];
  const bestSellers = bestSellersQuery.data ?? [];
  const testimonials = testimonialsQuery.data ?? [];
  const blogPosts = blogPostsQuery.data ?? [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <Header navigation={navigation} />

        <CategoryShortcuts categories={categories} navigation={navigation} />

        <HeroSection slides={heroSlides} navigation={navigation} />

        <View style={styles.featuresRow}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <MaterialCommunityIcons name={feature.icon} size={20} color={colors.purple.DEFAULT} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
            </View>
          ))}
        </View>

        <CategorySection
          categories={categories}
          isPending={categoriesQuery.isPending}
          isError={categoriesQuery.isError}
          error={categoriesQuery.error}
          onRetry={() => categoriesQuery.refetch()}
          navigation={navigation}
        />

        <FeaturedCollection
          products={featuredProducts}
          isPending={featuredProductsQuery.isPending}
          isError={featuredProductsQuery.isError}
          error={featuredProductsQuery.error}
          onRetry={() => featuredProductsQuery.refetch()}
          navigation={navigation}
        />

        <TryOnPromo navigation={navigation} />

        <NewArrivals
          products={newArrivals}
          isPending={newArrivalsQuery.isPending}
          isError={newArrivalsQuery.isError}
          error={newArrivalsQuery.error}
          onRetry={() => newArrivalsQuery.refetch()}
          navigation={navigation}
        />

        <BestSellers
          products={bestSellers}
          isPending={bestSellersQuery.isPending}
          isError={bestSellersQuery.isError}
          error={bestSellersQuery.error}
          onRetry={() => bestSellersQuery.refetch()}
          navigation={navigation}
        />

        <Testimonials
          testimonials={testimonials}
          isPending={testimonialsQuery.isPending}
          isError={testimonialsQuery.isError}
          error={testimonialsQuery.error}
          onRetry={() => testimonialsQuery.refetch()}
        />

        <BlogSection
          posts={blogPosts}
          isPending={blogPostsQuery.isPending}
          isError={blogPostsQuery.isError}
          error={blogPostsQuery.error}
          onRetry={() => blogPostsQuery.refetch()}
          navigation={navigation}
        />

        <NewsletterSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  featuresRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  featureItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1E6FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#1F1233",
    textAlign: "center",
  },
  featureSubtitle: {
    fontSize: 9,
    color: "#8A7B99",
    textAlign: "center",
    marginTop: 2,
  },
});
