import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { AppError } from "../middleware/error.middleware";

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    page = "1",
    limit = "12",
    gender,
    category,
    minPrice,
    maxPrice,
    sort = "createdAt",
    order = "desc",
    featured,
    bestSeller,
    newArrival,
    search,
     images,
    texture,
    sale,
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, any> = {
    isActive: true,
  };

  if (gender) where.gender = (gender as string).toUpperCase();
  if (featured === "true") where.isFeatured = true;
  if (bestSeller === "true") where.isBestSeller = true;
  if (newArrival === "true") where.isNewArrival = true;
  if (category) where.category = { slug: category };
  if (texture) where.texture = { in: (texture as string).split(",") };
  if (sale === "true") where.salePrice = { not: null };

  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { description: { contains: search as string } },
      { tags: { contains: search as string } },
    ];
  }

  if (minPrice || maxPrice) {
    where.basePrice = {};

    if (minPrice) {
      where.basePrice.gte = parseFloat(
        minPrice as string
      );
    }

    if (maxPrice) {
      where.basePrice.lte = parseFloat(
        maxPrice as string
      );
    }
  }

  const orderBy: Record<string, string> = {};
  orderBy[sort as string] = order as string;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
    include: {
  images: true,

  category: {
    select: {
      name: true,
      slug: true,
      gender: true,
    },
  },

  variants: true,
  includedItems: true,
  faqs: true,
  careGuides: true,
  features: true,
  highlights: true,
},
      skip,
      take: limitNum,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  const parsed = products.map((p) => ({
    ...p,
    tags: safeParseJson(p.tags, []),
  }));

  res.json({
    success: true,
    data: parsed,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      isActive: true,
    },

    include: {
      images: {
        orderBy: {
          angle: "asc",
        },
      },
       includedItems: true,
       faqs: true,
       careGuides: true,
      category: true,
      variants: true,
      highlights: true,
        features: true,
      reviews: {

        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.json({
    success: true,
    data: {
      ...product,
      tags: safeParseJson(product.tags, []),
      reviews: product.reviews.map((r) => ({
        ...r,
        images: safeParseJson(r.images, []),
      })),
    },
  });
};

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
    },
    include: {
      children: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: categories,
  });
};

export const getFeaturedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      isActive: true,
    },
    include: {
      images: {
        where: {
          isPrimary: true,
        },
        take: 1,
      },
      category: {
        select: {
          name: true,
          gender: true,
        },
      },
    },
    take: 8,
  });

  res.json({
    success: true,
    data: products.map((p) => ({
      ...p,
      tags: safeParseJson(p.tags, []),
    })),
  });
};

export const getRelatedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      gender: product.gender,
      id: {
        not: id,
      },
      isActive: true,
    },
    include: {
      images: {
        where: {
          isPrimary: true,
        },
        take: 1,
      },
    },
    take: 6,
  });

  res.json({
    success: true,
    data: related.map((p) => ({
      ...p,
      tags: safeParseJson(p.tags, []),
    })),
  });
};

/* -------------------- ADMIN CRUD -------------------- */

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log(req.body);
const {
  name,
  slug,
  shortDesc,
  description,
  categoryId,
  gender,
  basePrice,
  salePrice,
  stock,
  sku,
  brand,
  tags,
  images,

  material,
  capSize,
  length,
  density,
  texture,
  color,

  rating,

  isFeatured,
  isBestSeller,
  isNewArrival,
  features,
faqs,
careGuides,
includedItems,

} = req.body;
console.log("IMAGES RECEIVED:");
console.log(images);
    const product =
      await prisma.product.create({
    data: {
  name,
  slug,
  description,
  shortDesc,
material,
capSize,
length,
density,
texture,
color,

rating: Number(rating || 0),

isFeatured,
isBestSeller,
isNewArrival,
  

  tags: JSON.stringify(
    Array.isArray(tags)
      ? tags
      : []
  ),

  categoryId,
  gender,
          basePrice: Number(
            basePrice
          ),
          salePrice: salePrice
            ? Number(
                salePrice
              )
            : null,
          stock: Number(stock),
          sku,
          brand:
            brand || "HairsUp",

          images: {
            create:
              Array.isArray(
                images
              )
                ? images.map(
                  
                    (
                      url: string,
                      index: number
                    ) => ({
                      url,
                      isPrimary:
                        index === 0,
                        
                    })
                  )
                : [],
          },
          
          features: {
  create: Array.isArray(features)
    ? features
    : [],
},

faqs: {
  create: Array.isArray(faqs)
    ? faqs
    : [],
},

careGuides: {
  create: Array.isArray(careGuides)
    ? careGuides
    : [],
},

includedItems: {
  create: Array.isArray(includedItems)
    ? includedItems
    : [],
},
          
        },

       include: {
  images: true,
  features: true,
  faqs: true,
  careGuides: true,
  includedItems: true,
},
      });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
  console.error(
    "CREATE PRODUCT ERROR:"
  );

  console.error(error);

  res.status(500).json({
    success: false,
    message:
      error?.message ||
      "Failed to create product",
  });
}
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

const {
  name,
  slug,
  shortDesc,
  description,
  categoryId,
  gender,
  basePrice,
  salePrice,
  stock,
  sku,
  brand,
  tags,
  images,

  material,
  capSize,
  length,
  density,
  texture,
  color,

  rating,

  isFeatured,
  isBestSeller,
  isNewArrival,
  features,
faqs,
careGuides,
includedItems,
} = req.body;

  // Delete old images
  await prisma.productImage.deleteMany({
    where: {
      productId: id,
    },
  });
await prisma.productFeature.deleteMany({
  where: {
    productId: id,
  },
});

await prisma.productFAQ.deleteMany({
  where: {
    productId: id,
  },
});

await prisma.careGuide.deleteMany({
  where: {
    productId: id,
  },
});

await prisma.includedItem.deleteMany({
  where: {
    productId: id,
  },
});
  const product = await prisma.product.update({
    where: { id },

    data: {
      name,
      slug,
      shortDesc,
      description,
      categoryId,
      gender,
      material,
capSize,
length,
density,
texture,
color,

rating: Number(rating || 0),

isFeatured,
isBestSeller,
isNewArrival,
      basePrice: Number(basePrice),
      salePrice: salePrice
        ? Number(salePrice)
        : null,
      stock: Number(stock),
      sku,
      brand,

      tags: JSON.stringify(
        Array.isArray(tags)
          ? tags
          : typeof tags === "string"
          ? tags
              .split(",")
              .map((t) => t.trim())
          : []
      ),

      images: {
        create: Array.isArray(images)
          ? images.map(
              (
                url: string,
                index: number
              ) => ({
                url,
                isPrimary:
                  index === 0,
              })
            )
          : [],
      },
      features: {
  create: Array.isArray(features)
    ? features
    : [],
},

faqs: {
  create: Array.isArray(faqs)
    ? faqs
    : [],
},

careGuides: {
  create: Array.isArray(careGuides)
    ? careGuides
    : [],
},

includedItems: {
  create: Array.isArray(includedItems)
    ? includedItems
    : [],
},
    },

    include: {
  images: true,
  features: true,
  faqs: true,
  careGuides: true,
  includedItems: true,
},
  });

  res.json({
    success: true,
    data: product,
  });
};


export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

function safeParseJson(
  val: string,
  fallback: unknown
) {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}