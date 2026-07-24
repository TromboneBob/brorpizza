import type { Ingredient } from "./menuTypes";

export type CateringPizza = {
  id: string;
  displayName: string;
  description: string;
  image?: string;
  ingredientIds: string[];
  allergens: string[];
};

export type CateringCategory = {
  id: string;
  name: string;
  color: string;
  pizzas: CateringPizza[];
};

export type CateringMenu = {
  label: string;
  subtitle: string;
  ingredients: Record<string, Ingredient>;
  categories: CateringCategory[];
};
