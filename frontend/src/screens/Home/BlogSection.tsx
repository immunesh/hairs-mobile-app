import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HomeTabScreenProps } from "@/core/navigation/types";
import { colors } from "@/theme/colors";
import { getApiErrorMessage, resolveAssetUrl } from "@/services/api/client";
import type { BlogPost } from "@/services/api/types";

const VISIBLE_COUNT = 4;

function formatDate(post: BlogPost) {
  return new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US");
}

type Props = {
  posts: BlogPost[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  navigation: HomeTabScreenProps<"Home">["navigation"];
};

export function BlogSection({ posts, isPending, isError, error, onRetry, navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hair Care Tips & Style Guides</Text>
      <Text style={styles.subtitle}>Expert advice from our team</Text>

      {isPending ? (
        <View style={styles.statusBox}>
          <ActivityIndicator color={colors.purple.DEFAULT} />
        </View>
      ) : isError ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{getApiErrorMessage(error, "Could not load blog posts.")}</Text>
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>No blog posts yet.</Text>
        </View>
      ) : (
        <>
          <View style={styles.list}>
            {posts.slice(0, VISIBLE_COUNT).map((post) => {
              const imageUrl = resolveAssetUrl(post.image);

              return (
                <Pressable
                  key={post.id}
                  onPress={() => navigation.navigate("BlogDetail", { id: post.id })}
                  style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                >
                  <View style={styles.imageWrap}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} resizeMode="cover" style={styles.image} />
                    ) : (
                      <View style={[styles.image, styles.imagePlaceholder]} />
                    )}
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Blog</Text>
                    </View>
                  </View>

                  <View style={styles.content}>
                    <View>
                      <Text style={styles.date}>{formatDate(post)}</Text>
                      <Text style={styles.postTitle} numberOfLines={2}>
                        {post.title}
                      </Text>
                      <Text style={styles.excerpt} numberOfLines={2}>
                        {post.excerpt}
                      </Text>
                    </View>

                    <View style={styles.readMore}>
                      <Text style={styles.readMoreText}>Read More</Text>
                      <Ionicons name="arrow-forward" size={14} color={colors.purple.DEFAULT} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => navigation.navigate("BlogList")}
            style={({ pressed }) => [styles.viewMoreButton, pressed && styles.pressed]}
          >
            <Text style={styles.viewMoreText}>View More</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.purple.DEFAULT} />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F1233",
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#8A7B99",
    marginTop: 6,
    marginBottom: 20,
  },
  statusBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 28,
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
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
    minHeight: 268,
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageWrap: {
    height: 110,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: "#F1E6FB",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 12,
  },
  date: {
    fontSize: 11,
    color: "#9B93A6",
  },
  postTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1233",
    marginTop: 3,
  },
  excerpt: {
    fontSize: 12,
    lineHeight: 17,
    color: "#6B7280",
    marginTop: 3,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.purple.DEFAULT,
  },
  pressed: {
    opacity: 0.8,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: colors.purple.light,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  viewMoreText: {
    color: colors.purple.DEFAULT,
    fontSize: 14,
    fontWeight: "700",
  },
});
