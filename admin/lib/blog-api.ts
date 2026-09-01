const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllBlogs() {
  try {
    const response = await fetch(
      `${API_URL}/blogs/published`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch blogs");
    }

    const data = await response.json();

    return data.data || [];
  } catch (error) {
    console.error("Blog fetch error:", error);
    return [];
  }
}