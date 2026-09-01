"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const router = (0, express_1.Router)();
router.get("/", product_controller_1.getProducts);
router.get("/featured", product_controller_1.getFeaturedProducts);
router.get("/categories", product_controller_1.getCategories);
router.get("/:id", product_controller_1.getProductById);
router.post("/", product_controller_1.createProduct);
router.put("/:id", product_controller_1.updateProduct);
router.delete("/:id", product_controller_1.deleteProduct);
router.get("/:id/related", product_controller_1.getRelatedProducts);
exports.default = router;
//# sourceMappingURL=product.routes.js.map