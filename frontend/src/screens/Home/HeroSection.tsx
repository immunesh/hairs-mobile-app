import { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { ImageSourcePropType, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "@/theme/colors";
import type { HomeTabScreenProps } from "@/core/navigation/types";

export type HeroSlideView = {
  id: string;
  badge: string;
  headline: string;
  subheadline: string;
  description: string;
  cta: string;
  ctaSecondary: string;
  accent: string;
  imageSource: ImageSourcePropType;
};

type Props = {
  slides: HeroSlideView[];
  navigation: HomeTabScreenProps<"Home">["navigation"];
};

const CARD_MARGIN = 20;
const CARD_SPACING = 12;
const AUTO_SCROLL_INTERVAL = 4000;

export function HeroSection({ slides, navigation }: Props) {
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
    if (slides.length <= 1 || isInteracting) return;

    const timer = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      scrollRef.current?.scrollTo({ x: nextIndex * snapInterval, animated: true });
      setActiveIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);

    return () => clearTimeout(timer);
  }, [activeIndex, isInteracting, slides.length, snapInterval]);

  return (
    <View style={styles.container}>
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
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.card,
              { width: cardWidth, marginRight: index === slides.length - 1 ? 0 : CARD_SPACING },
            ]}
          >
            <Image source={slide.imageSource} resizeMode="cover" style={styles.cardBackground} />

            <View style={styles.cardOverlay} />

            <View style={styles.pill}>
              <Text style={styles.pillText}>{slide.badge}</Text>
            </View>
            <Text style={styles.heading}>
              <Text style={styles.headingDark}>{slide.headline}{"\n"}</Text>
              <Text style={[styles.headingAccent, { color: slide.accent }]}>
                {slide.subheadline}
              </Text>
            </Text>

            <Text style={styles.description}>{slide.description}</Text>

            <View style={styles.buttonsRow}>
              <Pressable
                onPress={() => navigation.navigate("Categories")}
                style={({ pressed }) => [styles.shopButtonWrapper, pressed && styles.pressed]}
              >
                <LinearGradient
                  colors={[colors.purple.light, colors.purple.DEFAULT]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shopButton}
                >
                  <Text style={styles.shopButtonText} numberOfLines={1}>
                    {slide.cta}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.white} />
                </LinearGradient>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate("TryOn")}
                style={({ pressed }) => [styles.tryOnButton, pressed && styles.pressed]}
              >
                <Ionicons name="sparkles" size={16} color={colors.purple.DEFAULT} />
                <Text style={styles.tryOnButtonText} numberOfLines={1}>
                  {slide.ctaSecondary}
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      {slides.length > 1 ? (
        <View style={styles.dotsRow}>
          {slides.map((slide, index) => (
            <View key={slide.id} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  pressed: {
    opacity: 0.75,
  },
  scrollContent: {
    paddingHorizontal: CARD_MARGIN,
  },
  card: {
    position: "relative",
    backgroundColor: "#F7EEFB",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(247, 238, 251, 0.7)",
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  pillText: {
    color: colors.purple.DEFAULT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 14,
  },
  headingDark: {
    color: "#1F1233",
  },
  headingAccent: {
    color: colors.purple.DEFAULT,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5A4C6B",
    marginBottom: 18,
  },
  buttonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  shopButtonWrapper: {
    flexGrow: 1,
    flexBasis: 140,
  },
  shopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  shopButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
  tryOnButton: {
    flexGrow: 1,
    flexBasis: 140,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.purple.light,
  },
  tryOnButtonText: {
    color: colors.purple.DEFAULT,
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
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
