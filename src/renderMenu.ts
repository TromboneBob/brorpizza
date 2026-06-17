import type { Menu, MenuItem } from "./menuTypes";

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

function renderMenuItem(menu: Menu, item: MenuItem) {
  return `
              <li data-pizza="${escapeHtml(item.id)}">
                <div class="item-row">
                  <span class="item-name">${escapeHtml(item.displayName)}</span>
                  <span class="item-badge"></span>
                  <span class="item-dots"></span>
                  <span class="item-price">${escapeHtml(formatMenuPrice(menu, item.price))}</span>
                </div>
                <p class="item-desc">${escapeHtml(item.description)}</p>
                <p class="allergens">${escapeHtml(item.allergens.join(" · "))}</p>
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
