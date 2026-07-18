import "./style.css";

const COMING_SOON = false;

// Disabled for now — re-enable when the pizza detail modal is ready.
const PIZZA_MODAL_ENABLED = false;

if (COMING_SOON) {
  const main = document.querySelector("main")!;
  main.className = "coming-soon";
  main.innerHTML = `
    <h1 class="sr-only">Bror – Surdeigspizza i Rosendal</h1>
    <div class="logo"><img src="/bror-logo.svg" alt="Bror logo" /></div>
    <p class="coming-soon-title">Vi åpner snart!</p>
    <p class="coming-soon-location">I vinduet på Rosendal Samfunnshus</p>
    <p class="tagline">Surdeigspizza</p>
  `;
}

const SUPABASE_FUNCTION_URL = "https://bfttnghiuqskmpfsmfep.supabase.co/functions/v1/pizza-status";

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  Åpen: { cls: "open", label: "ÅPEN" },
  "Åpner snart": { cls: "soon", label: "ÅPNER LØRDAG 18.07" },
  "Nesten utsolgt": { cls: "low", label: "NESTEN UTSOLGT" },
  Utsolgt: { cls: "soldout", label: "UTSOLGT" },
  Stengt: { cls: "closed", label: "STENGT" },
};

const PIZZA_STATUS_MAP: Record<string, { cls: string; label: string }> = {
  "Nesten utsolgt": { cls: "low", label: "NESTEN UTSOLGT" },
  Utsolgt: { cls: "soldout", label: "UTSOLGT" },
};

type PizzaStatuses = Record<string, string>;

function applyPizzaStatuses(pizzas: PizzaStatuses | null | undefined) {
  if (!pizzas || typeof pizzas !== "object") return;

  document.querySelectorAll<HTMLElement>("[data-pizza]").forEach((li) => {
    const id = li.dataset.pizza;
    if (!id) return;

    const cfg = PIZZA_STATUS_MAP[pizzas[id]];
    const badge = li.querySelector<HTMLElement>(".item-badge");
    if (!cfg || !badge) return;

    badge.textContent = cfg.label;
    badge.classList.add(cfg.cls);
    if (cfg.cls === "soldout") {
      li.classList.add("pizza-soldout");
    }
  });
}

async function loadStatus() {
  if (!SUPABASE_FUNCTION_URL) return;

  try {
    const res = await fetch(SUPABASE_FUNCTION_URL);
    if (!res.ok) return;

    const data = (await res.json()) as {
      status?: string;
      pizzas?: PizzaStatuses;
    };
    if (!data.status) return;

    const cfg = STATUS_MAP[data.status];
    const stamp = document.getElementById("statusStamp");
    if (!cfg || !stamp) return;

    stamp.textContent = cfg.label;
    stamp.classList.add(cfg.cls);

    applyPizzaStatuses(data.pizzas);
  } catch {
    // Leave the neutral loading stamp if the status endpoint is unavailable.
  }
}

void loadStatus();

type Ingredient = {
  name: string;
  description: string;
};

function createModal() {
  const existing = document.getElementById("pizzaModal");
  if (existing) return existing;

  const overlay = document.createElement("div");
  overlay.id = "pizzaModal";
  overlay.className = "pizza-modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "pizzaModalTitle");
  overlay.setAttribute("aria-describedby", "pizzaModalDescription");
  overlay.innerHTML = `
    <div class="pizza-modal" role="document">
      <img id="pizzaModalImage" class="pizza-modal-image" alt="" />
      <div class="pizza-modal-body">
        <div class="pizza-modal-header">
          <h2 id="pizzaModalTitle" class="pizza-modal-heading"></h2>
          <button class="pizza-modal-close" type="button" aria-label="Lukk">×</button>
        </div>
        <p id="pizzaModalDescription" class="pizza-modal-description"></p>
        <p class="pizza-modal-section-title">Ingredienser</p>
        <ul id="pizzaModalIngredients" class="pizza-modal-ingredients"></ul>
        <div class="pizza-modal-footer">
          <span id="pizzaModalPrice" class="pizza-modal-price"></span>
          <span id="pizzaModalAllergens" class="pizza-modal-allergens"></span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  return overlay;
}

function setImage(img: HTMLImageElement, src: string, name: string) {
  if (src) {
    img.src = src;
    img.alt = name;
    img.hidden = false;
  } else {
    img.hidden = true;
  }
}

function renderIngredients(list: HTMLElement, ingredients: Ingredient[]) {
  list.innerHTML = ingredients
    .map(
      ({ name, description }) => `
        <li>
          <p class="pizza-modal-ingredient-name">${escapeHtml(name)}</p>
          <p class="pizza-modal-ingredient-description">${escapeHtml(description)}</p>
        </li>
      `,
    )
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let lastFocusedElement: Element | null = null;
let modalOpen = false;

function openModal(button: HTMLButtonElement) {
  const overlay = createModal();
  const closeBtn = overlay.querySelector<HTMLButtonElement>(".pizza-modal-close");
  const title = overlay.querySelector<HTMLHeadingElement>("#pizzaModalTitle");
  const description = overlay.querySelector<HTMLParagraphElement>("#pizzaModalDescription");
  const image = overlay.querySelector<HTMLImageElement>("#pizzaModalImage");
  const ingredientsList = overlay.querySelector<HTMLUListElement>("#pizzaModalIngredients");
  const price = overlay.querySelector<HTMLSpanElement>("#pizzaModalPrice");
  const allergens = overlay.querySelector<HTMLSpanElement>("#pizzaModalAllergens");

  if (!closeBtn || !title || !description || !image || !ingredientsList || !price || !allergens) return;

  const name = button.dataset.pizzaName ?? "";
  const desc = button.dataset.pizzaDescription ?? "";
  const imageSrc = button.dataset.pizzaImage ?? "";
  const priceText = button.dataset.pizzaPrice ?? "";
  const allergensText = button.dataset.pizzaAllergens ?? "";
  const ingredients: Ingredient[] = JSON.parse(button.dataset.pizzaIngredients ?? "[]");

  title.textContent = name;
  description.textContent = desc;
  setImage(image, imageSrc, name);
  price.textContent = priceText;
  allergens.textContent = allergensText;
  renderIngredients(ingredientsList, ingredients);

  lastFocusedElement = document.activeElement;
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  modalOpen = true;
  closeBtn.focus();
}

function closeModal(overlay: HTMLElement) {
  overlay.classList.remove("open");
  document.body.style.overflow = "";
  modalOpen = false;

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function trapFocus(event: KeyboardEvent) {
  const modal = document.querySelector<HTMLElement>(".pizza-modal");
  if (!modal) return;

  const focusable = modal.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (!modalOpen) return;

  if (event.key === "Escape") {
    const overlay = document.getElementById("pizzaModal");
    if (overlay) closeModal(overlay);
  } else if (event.key === "Tab") {
    trapFocus(event);
  }
}

function initPizzaModals() {
  const overlay = createModal();

  document.querySelectorAll<HTMLButtonElement>(".item-button").forEach((button) => {
    button.addEventListener("click", () => {
      if (!PIZZA_MODAL_ENABLED) return;
      openModal(button);
    });
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal(overlay);
    }
  });

  overlay.querySelector<HTMLButtonElement>(".pizza-modal-close")?.addEventListener("click", () => {
    closeModal(overlay);
  });

  document.addEventListener("keydown", onKeyDown);
}

initPizzaModals();
