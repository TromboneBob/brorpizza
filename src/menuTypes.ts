export type MenuItem = {
  id: string;
  displayName: string;
  schemaName: string;
  description: string;
  schemaDescription: string;
  allergens: string[];
  price: number;
};

export type Menu = {
  label: string;
  subtitle: string;
  currency: string;
  currencyDisplay: string;
  items: MenuItem[];
};
