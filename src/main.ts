import "./style.css";

const SUPABASE_FUNCTION_URL =
  "https://bfttnghiuqskmpfsmfep.supabase.co/functions/v1/pizza-status";

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  Åpen: { cls: "open", label: "ÅPEN" },
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
