import type { CateringMenu, CateringPizza } from "./cateringMenuTypes";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCateringPizza(pizza: CateringPizza) {
  return `
              <li class="catering-pizza">
                <div class="item-row">
                  <span class="item-name">${escapeHtml(pizza.displayName)}</span>
                </div>
                <p class="item-desc">${escapeHtml(pizza.description)}</p>
                <p class="allergens">${escapeHtml(pizza.allergens.join(" · "))}</p>
              </li>`;
}

function renderCategory(category: CateringMenu["categories"][number]) {
  const pizzas = category.pizzas.map(renderCateringPizza).join("\n");

  return `
            <section class="catering-category">
              <div class="category-header" style="--cat-color: ${escapeHtml(category.color)}">
                <span class="category-label">${escapeHtml(category.name)}</span>
              </div>
              <ul class="catering-items">
${pizzas}
              </ul>
            </section>`;
}

export function renderCateringMenuItems(menu: CateringMenu) {
  return menu.categories.map(renderCategory).join("\n");
}
