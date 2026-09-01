"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hero_controller_1 = require("../controllers/hero.controller");
const router = (0, express_1.Router)();
// GET ALL HERO SLIDES
router.get("/", hero_controller_1.getHeroSlides);
// GET SINGLE HERO SLIDE
router.get("/:id", hero_controller_1.getHeroSlideById);
// CREATE HERO SLIDE
router.post("/", hero_controller_1.createHeroSlide);
// UPDATE HERO SLIDE
router.put("/:id", hero_controller_1.updateHeroSlide);
// DELETE HERO SLIDE
router.delete("/:id", hero_controller_1.deleteHeroSlide);
exports.default = router;
//# sourceMappingURL=hero.routes.js.map