import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const getAllStores = async (
  req: Request,
  res: Response
): Promise<void> => {
  const stores =
    await prisma.storeLocation.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  res.json({
    success: true,
    data: stores,
  });
};

export const getStoreById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const store =
    await prisma.storeLocation.findUnique({
      where: { id },
    });

  if (!store) {
    res.status(404).json({
      success: false,
      message: "Store not found",
    });
    return;
  }

  res.json({
    success: true,
    data: store,
  });
};

export const createStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    name,
    address,
    city,
    state,
    pincode,
    phone,
    email,
    hours,
    lat,
    lng,
  } = req.body;

  const store =
    await prisma.storeLocation.create({
      data: {
        name,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        hours,
        lat,
        lng,
      },
    });

  res.status(201).json({
    success: true,
    data: store,
  });
};

export const updateStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const store =
    await prisma.storeLocation.update({
      where: { id },
      data: req.body,
    });

  res.json({
    success: true,
    data: store,
  });
};

export const deleteStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  await prisma.storeLocation.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: "Store deleted successfully",
  });
};

export const toggleStoreStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const store =
    await prisma.storeLocation.findUnique({
      where: { id },
    });

  if (!store) {
    res.status(404).json({
      success: false,
      message: "Store not found",
    });
    return;
  }

  const updated =
    await prisma.storeLocation.update({
      where: { id },
      data: {
        isActive: !store.isActive,
      },
    });

  res.json({
    success: true,
    data: updated,
  });
};