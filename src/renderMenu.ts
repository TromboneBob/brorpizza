import type { Ingredient, Menu, MenuItem } from "./menuTypes";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMenuPrice(menu: Menu, price: number) {
  return `${menu.currencyDisplay} ${price}`;
}

function resolveIngredients(menu: Menu, item: MenuItem): Ingredient[] {
  return item.ingredientIds
    .map((id) => menu.ingredients[id])
    .filter((ingredient): ingredient is Ingredient => Boolean(ingredient));
}

function renderIngredientsData(menu: Menu, item: MenuItem) {
  return escapeHtml(JSON.stringify(resolveIngredients(menu, item)));
}

function renderMenuItem(menu: Menu, item: MenuItem) {
  const ingredientsAttr = renderIngredientsData(menu, item);
  const image = item.image ?? "/pizza-placeholder.png";

  return `
              <li data-pizza="${escapeHtml(item.id)}">
                <button
                  class="item-button"
                  type="button"
                  aria-label="Les mer om ${escapeHtml(item.displayName)}"
                  data-pizza-name="${escapeHtml(item.displayName)}"
                  data-pizza-description="${escapeHtml(item.description)}"
                  data-pizza-image="${escapeHtml(image)}"
                  data-pizza-price="${escapeHtml(formatMenuPrice(menu, item.price))}"
                  data-pizza-allergens="${escapeHtml(item.allergens.join(" · "))}"
                  data-pizza-ingredients="${ingredientsAttr}"
                >
                  <div class="item-row">
                    <span class="item-name">${escapeHtml(item.displayName)}</span>
                    <span class="item-badge"></span>
                    <span class="item-dots"></span>
                    <span class="item-price">${escapeHtml(formatMenuPrice(menu, item.price))}</span>
                  </div>
                  <p class="item-desc">${escapeHtml(item.description)}</p>
                  <p class="allergens">${escapeHtml(item.allergens.join(" · "))}</p>
                </button>
              </li>`;
}

export function renderMenuItems(menu: Menu) {
  return menu.items.map((item) => renderMenuItem(menu, item)).join("\n");
}

export function renderDashboardPizzas(menu: Menu) {
  return JSON.stringify(
    menu.items.map((item) => ({
      id: item.id,
      label: item.displayName,
    })),
  ).replaceAll("</", "<\\/");
}
