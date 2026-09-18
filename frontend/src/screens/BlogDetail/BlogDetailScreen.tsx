import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/core/navigation/types";
import { useBlogPost } from "@/features/home/hooks";
import { getApiErrorMessage, resolveAssetUrl } from "@/services/api/client";
import type { BlogPost } from "@/services/api/types";

type Props = NativeStackScreenProps<RootStackParamList, "BlogDetail">;

function formatDate(post: BlogPost) {
  return new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '');
}

export function BlogDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { width } = useWindowDimensions();
  const { data: post, isPending, isError, error, refetch } = useBlogPost(id);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  if (isPending) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.purple.DEFAULT} />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>
          {getApiErrorMessage(error, "Could not load blog post.")}
        </Text>
        <Pressable onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const imageUrl = resolveAssetUrl(post.image);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F1233" />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Article</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} resizeMode="cover" style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.imagePlaceholder]} />
        )}
        
        <View style={styles.articleBody}>
          <Text style={styles.date}>{formatDate(post)}</Text>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.bodyText}>
            {stripHtml(post.content || "No content available.")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
  placeholder: {
    width: 40,
  },
  content: {
    paddingBottom: 40,
  },
  coverImage: {
    width: "100%",
    height: 250,
  },
  imagePlaceholder: {
    backgroundColor: "rgba(91, 33, 182, 0.05)",
  },
  articleBody: {
    padding: 16,
  },
  date: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8A7B99",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F1233",
    lineHeight: 32,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#5A4C6B",
    textAlign: "center",
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: colors.purple.DEFAULT,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 99,
    marginTop: 16,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  bodyText: {
    fontSize: 15,
    color: "#4A3F5B",
    lineHeight: 24,
  }
});
