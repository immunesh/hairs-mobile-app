import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const getHeroSlides = async (
  req: Request,
  res: Response
) => {
  try {
    const { active } = req.query;

    const heroSlides = await prisma.heroSlide.findMany({
      where:
        active === "true"
          ? { isActive: true }
          : undefined,
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    res.json(heroSlides);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch hero slides",
    });
  }
};

export const getHeroSlideById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const heroSlide = await prisma.heroSlide.findUnique({
      where: {
        id,
      },
    });

    if (!heroSlide) {
      return res.status(404).json({
        message: "Hero slide not found",
      });
    }

    res.json(heroSlide);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch hero slide",
    });
  }
};

export const createHeroSlide = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      headline,
      subheadline,
      description,
      image,
      badge,
      tag,
      cta,
      ctaLink,
      ctaSecondary,
      ctaSecondaryLink,
      accent,
      order,
      isActive,
    } = req.body;

    const heroSlide = await prisma.heroSlide.create({
      data: {
        headline,
        subheadline,
        description,
        image,
        badge,
        tag,
        cta,
        ctaLink,
        ctaSecondary,
        ctaSecondaryLink,
        accent,
        order: order !== undefined ? Number(order) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    res.status(201).json(heroSlide);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create hero slide",
    });
  }
};

export const updateHeroSlide = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const {
      headline,
      subheadline,
      description,
      image,
      badge,
      tag,
      cta,
      ctaLink,
      ctaSecondary,
      ctaSecondaryLink,
      accent,
      order,
      isActive,
    } = req.body;

    const heroSlide = await prisma.heroSlide.update({
      where: {
        id,
      },
      data: {
        headline,
        subheadline,
        description,
        image,
        badge,
        tag,
        cta,
        ctaLink,
        ctaSecondary,
        ctaSecondaryLink,
        accent,
        order: order !== undefined ? Number(order) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    res.json(heroSlide);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update hero slide",
    });
  }
};

export const deleteHeroSlide = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await prisma.heroSlide.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
      message: "Hero slide deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete hero slide",
    });
  }
};
