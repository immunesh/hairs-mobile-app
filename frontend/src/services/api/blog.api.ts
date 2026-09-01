import { apiClient, unwrap } from "./client";
import type { BlogPost } from "./types";

export async function getPublishedBlogPosts() {
  const { data } = await apiClient.get<BlogPost[]>("/blogs/published");
  return unwrap(data);
}

export async function getBlogPost(id: string) {
  const { data } = await apiClient.get<BlogPost>(`/blogs/${id}`);
  return unwrap(data);
}
