 
import { Router } from "express";
import Category, { find } from "../models/Category";
const router = Router();

router.get("/", async (req, res) => {
  const categories = await find();
  res.json(categories);
});

router.post("/", async (req, res) => {
  const newCategory = new Category(req.body);
  await newCategory.save();
  res.status(201).json(newCategory);
});

export default router;
