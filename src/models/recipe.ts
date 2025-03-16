export interface RecipeItem {
  id: number;
  name: string;
  sku: string;
  cogs: number;
}

export interface Ingredient {
  id: number;
  name: string;
  inventory_id: number;
  quantity: number;
  item: string;
  uom: string;
}

export interface RecipeDetailResponse {
  meta: { message: string; int: number; status: string; response_time: string };
  recipe: RecipeItem;
  ingredients: Ingredient[];
}

export interface IngredientData {
  recipe_id: number;
  inventory_id: number;
  quantity: number;
}
