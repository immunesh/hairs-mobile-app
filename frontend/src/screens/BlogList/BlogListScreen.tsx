import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/core/navigation/types";
import { getApiErrorMessage, resolveAssetUrl } from "@/services/api/client";
import { useBlogPosts } from "@/features/home/hooks";
import type { BlogPost } from "@/services/api/types";

type Props = NativeStackScreenProps<RootStackParamList, "BlogList">;

function formatDate(post: BlogPost) {
  return new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogListScreen({ navigation }: Props) {
  const { data: posts = [], isPending, isError, error, refetch } = useBlogPosts();

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePostPress = (id: string) => {
    navigation.navigate("BlogDetail", { id });
  };

  const renderItem = ({ item }: { item: BlogPost }) => {
    const imageUrl = resolveAssetUrl(item.image);

    return (
      <Pressable
        onPress={() => handlePostPress(item.id)}
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

        <View style={styles.cardContent}>
          <Text style={styles.date}>{formatDate(item)}</Text>
          <Text style={styles.postTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.excerpt} numberOfLines={2}>
            {item.excerpt}
          </Text>
          <View style={styles.readMore}>
            <Text style={styles.readMoreText}>Read Article</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.purple.DEFAULT} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F1233" />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>All Articles</Text>
          <Text style={styles.headerSubtitle}>Hair care tips & style guides</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.purple.DEFAULT} />
          <Text style={styles.loadingText}>Fetching articles...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>
            {getApiErrorMessage(error, "Could not load blog posts.")}
          </Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No blog posts available right now.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(91, 33, 182, 0.08)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(91, 33, 182, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F1233",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#8A7B99",
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#8A7B99",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 14,
    color: "#5A4C6B",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.purple.DEFAULT,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 99,
    marginTop: 8,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyText: {
    fontSize: 14,
    color: "#8A7B99",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    width: "100%",
    height: 120,
    backgroundColor: "rgba(91, 33, 182, 0.05)",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: colors.purple.dark,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.purple.DEFAULT,
  },
  cardContent: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  date: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8A7B99",
  },
  postTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1233",
    marginTop: 4,
    lineHeight: 18,
    height: 36, // fix height to align grid
  },
  excerpt: {
    fontSize: 11,
    lineHeight: 15,
    color: "#6B7280",
    marginTop: 4,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  readMoreText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.purple.DEFAULT,
  },
});
