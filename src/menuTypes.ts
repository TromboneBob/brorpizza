export type Ingredient = {
  name: string;
  description: string;
};

export type MenuItem = {
  id: string;
  displayName: string;
  schemaName: string;
  description: string;
  schemaDescription: string;
  image?: string;
  ingredientIds: string[];
  allergens: string[];
  price: number;
};

export type Menu = {
  label: string;
  subtitle: string;
  currency: string;
  currencyDisplay: string;
  ingredients: Record<string, Ingredient>;
  items: MenuItem[];
};