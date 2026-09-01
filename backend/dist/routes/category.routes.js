"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
// GET ALL CATEGORIES
router.get("/", category_controller_1.getCategories);
// GET SINGLE CATEGORY
router.get("/:id", category_controller_1.getCategoryById);
// CREATE CATEGORY
router.post("/", category_controller_1.createCategory);
// UPDATE CATEGORY
router.put("/:id", category_controller_1.updateCategory);
// DELETE CATEGORY
router.delete("/:id", category_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map