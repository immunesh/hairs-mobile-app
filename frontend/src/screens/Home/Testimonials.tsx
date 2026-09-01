import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import { getApiErrorMessage, resolveAssetUrl } from "@/services/api/client";
import type { Testimonial } from "@/services/api/types";
import { RatingStars } from "./ProductCard";

const CARD_MARGIN = 20;
const CARD_SPACING = 14;
const AUTO_SCROLL_INTERVAL = 4500;

function initials(testimonial: Testimonial) {
  return `${testimonial.user.firstName[0] ?? ""}${testimonial.user.lastName[0] ?? ""}`.toUpperCase();
}

function quoteText(testimonial: Testimonial) {
  return testimonial.body.trim() || testimonial.title?.trim() || "Loved the quality and fit!";
}

function metaLine(testimonial: Testimonial) {
  return [testimonial.user.city, testimonial.product?.name].filter(Boolean).join(" · ");
}

type Props = {
  testimonials: Testimonial[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
};

export function Testimonials({ testimonials, isPending, isError, error, onRetry }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - CARD_MARGIN * 2;
  const snapInterval = cardWidth + CARD_SPACING;

  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    setActiveIndex(index);
  };

  useEffect(() => {
    if (testimonials.length <= 1 || isInteracting) return;

    const timer = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % testimonials.length;
      scrollRef.current?.scrollTo({ x: nextIndex * snapInterval, animated: true });
      setActiveIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);

    return () => clearTimeout(timer);
  }, [activeIndex, isInteracting, testimonials.length, snapInterval]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Real Stories. Real Confidence.</Text>
      <Text style={styles.subtitle}>See what our customers say about HairsUp</Text>

      {isPending ? (
        <View style={styles.statusBox}>
          <ActivityIndicator color={colors.purple.DEFAULT} />
        </View>
      ) : isError ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            {getApiErrorMessage(error, "Could not load testimonials.")}
          </Text>
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : testimonials.length === 0 ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>No customer reviews yet.</Text>
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={snapInterval}
            snapToAlignment="start"
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => setIsInteracting(true)}
            onScrollEndDrag={() => setIsInteracting(false)}
          >
            {testimonials.map((testimonial, index) => {
              const avatarUrl = resolveAssetUrl(testimonial.user.avatar);
              const meta = metaLine(testimonial);
              const liked = testimonial.isVerified || testimonial.rating >= 5;

              return (
                <View
                  key={testimonial.id}
                  style={[
                    styles.card,
                    {
                      width: cardWidth,
                      marginRight: index === testimonials.length - 1 ? 0 : CARD_SPACING,
                    },
                  ]}
                >
                  <View style={styles.cardTop}>
                    <RatingStars rating={testimonial.rating} />
                    <Ionicons
                      name={liked ? "heart" : "heart-outline"}
                      size={18}
                      color={liked ? "#EC4899" : "#C4B5D6"}
                    />
                  </View>

                  <Text style={styles.quote} numberOfLines={5}>
                    “{quoteText(testimonial)}”
                  </Text>

                  <View style={styles.footer}>
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>{initials(testimonial)}</Text>
                      </View>
                    )}

                    <View style={styles.footerText}>
                      <Text style={styles.name} numberOfLines={1}>
                        {testimonial.user.firstName} {testimonial.user.lastName}
                      </Text>
                      {meta ? (
                        <Text style={styles.meta} numberOfLines={1}>
                          {meta}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {testimonials.length > 1 ? (
            <View style={styles.dotsRow}>
              {testimonials.map((testimonial, index) => (
                <View
                  key={testimonial.id}
                  style={[styles.dot, index === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F1233",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#8A7B99",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statusBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 13,
    color: "#5A4C6B",
    textAlign: "center",
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
  scrollContent: {
    paddingHorizontal: CARD_MARGIN,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quote: {
    fontSize: 14,
    lineHeight: 21,
    fontStyle: "italic",
    color: "#3F3350",
    marginTop: 12,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.purple.light,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  footerText: {
    flexShrink: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1233",
  },
  meta: {
    fontSize: 12,
    color: "#8A7B99",
    marginTop: 1,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purple.light,
    opacity: 0.4,
  },
  dotActive: {
    width: 18,
    opacity: 1,
    backgroundColor: colors.purple.DEFAULT,
  },
});
