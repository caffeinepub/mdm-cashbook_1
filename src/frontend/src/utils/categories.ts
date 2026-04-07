import { Category } from "../backend";

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.cookingConversion]: "कुकिंग कन्वर्जन",
  [Category.cookHelperHonorarium]: "कुक कम हेल्पर मानदेय",
  [Category.milkWarmingHonorarium]: "दूध गर्म मानदेय",
  [Category.gasCylinder]: "गैस सिलेंडर राशि",
  [Category.sugar]: "चीनी राशि",
  [Category.other]: "अन्य",
};

export const CATEGORY_ORDER: Category[] = [
  Category.cookingConversion,
  Category.cookHelperHonorarium,
  Category.milkWarmingHonorarium,
  Category.gasCylinder,
  Category.sugar,
  Category.other,
];

export function getCategoryLabel(cat: Category): string {
  return CATEGORY_LABELS[cat] ?? cat;
}
