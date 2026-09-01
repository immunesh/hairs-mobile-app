"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleStoreStatus = exports.deleteStore = exports.updateStore = exports.createStore = exports.getStoreById = exports.getAllStores = void 0;
const prisma_1 = require("../db/prisma");
const getAllStores = async (req, res) => {
    const stores = await prisma_1.prisma.storeLocation.findMany({
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
exports.getAllStores = getAllStores;
const getStoreById = async (req, res) => {
    const { id } = req.params;
    const store = await prisma_1.prisma.storeLocation.findUnique({
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
exports.getStoreById = getStoreById;
const createStore = async (req, res) => {
    const { name, address, city, state, pincode, phone, email, hours, lat, lng, } = req.body;
    const store = await prisma_1.prisma.storeLocation.create({
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
exports.createStore = createStore;
const updateStore = async (req, res) => {
    const { id } = req.params;
    const store = await prisma_1.prisma.storeLocation.update({
        where: { id },
        data: req.body,
    });
    res.json({
        success: true,
        data: store,
    });
};
exports.updateStore = updateStore;
const deleteStore = async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.storeLocation.delete({
        where: { id },
    });
    res.json({
        success: true,
        message: "Store deleted successfully",
    });
};
exports.deleteStore = deleteStore;
const toggleStoreStatus = async (req, res) => {
    const { id } = req.params;
    const store = await prisma_1.prisma.storeLocation.findUnique({
        where: { id },
    });
    if (!store) {
        res.status(404).json({
            success: false,
            message: "Store not found",
        });
        return;
    }
    const updated = await prisma_1.prisma.storeLocation.update({
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
exports.toggleStoreStatus = toggleStoreStatus;
//# sourceMappingURL=store.controller.js.map