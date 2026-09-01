import { Router } from "express";
import {
  getHeroSlides,
  getHeroSlideById,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from "../controllers/hero.controller";

const router = Router();

// GET ALL HERO SLIDES
router.get("/", getHeroSlides);

// GET SINGLE HERO SLIDE
router.get("/:id", getHeroSlideById);

// CREATE HERO SLIDE
router.post("/", createHeroSlide);

// UPDATE HERO SLIDE
router.put("/:id", updateHeroSlide);

// DELETE HERO SLIDE
router.delete("/:id", deleteHeroSlide);

export default router;
