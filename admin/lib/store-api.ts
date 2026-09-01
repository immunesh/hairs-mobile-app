const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllStores = async () => {
  const response = await fetch(
    `${API_URL}/stores`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch stores"
    );
  }

  return data.data;
};

export const getStoreById = async (
  id: string
) => {
  const response = await fetch(
    `${API_URL}/stores/${id}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch store"
    );
  }

  return data.data;
};