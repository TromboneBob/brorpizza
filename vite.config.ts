import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import type { Menu } from "./src/menuTypes";
import { renderDashboardPizzas, renderMenuItems } from "./src/renderMenu";
import { getFaqJsonLd, getRestaurantJsonLd } from "./src/structuredData";

const menuPath = fileURLToPath(new URL("./src/menu.json", import.meta.url));
const indexPath = fileURLToPath(new URL("./index.html", import.meta.url));
const dashboardPath = fileURLToPath(
  new URL("./dashboard.html", import.meta.url),
);
const menuPlaceholder = "<!-- bror-menu-items -->";
const dashboardPizzasPlaceholder = "__BROR_DASHBOARD_PIZZAS__";

function readMenu() {
  return JSON.parse(readFileSync(menuPath, "utf8")) as Menu;
}

function toJsonLd(data: unknown) {
  return JSON.stringify(data, null, 2).replaceAll("</", "<\\/");
}

function injectMenuHtml(html: string, menu: Menu) {
  return html.replace(menuPlaceholder, renderMenuItems(menu));
}

function injectDashboardPizzas(html: string, menu: Menu) {
  return html.replace(dashboardPizzasPlaceholder, renderDashboardPizzas(menu));
}

function jsonLdScript(id: string, data: unknown) {
  return `<script id="${id}" type="application/ld+json">${toJsonLd(data)}</script>`;
}

function injectStructuredData(html: string, menu: Menu) {
  const scripts = [
    jsonLdScript("restaurant-jsonld", getRestaurantJsonLd(menu)),
    jsonLdScript("faq-jsonld", getFaqJsonLd(menu)),
  ].join("\n    ");

  return html.replace("</head>", `    ${scripts}\n  </head>`);
}

function menuHtmlPlugin() {
  return {
    name: "bror-menu-html",
    configureServer(server: {
      watcher: {
        add: (path: string) => void;
        on: (event: "change", callback: (path: string) => void) => void;
      };
      ws: { send: (payload: { type: "full-reload" }) => void };
    }) {
      server.watcher.add(menuPath);
      server.watcher.on("change", (path) => {
        if (path === menuPath) {
          server.ws.send({ type: "full-reload" });
        }
      });
    },
    transformIndexHtml(html: string) {
      const menu = readMenu();
      if (html.includes(menuPlaceholder)) {
        return injectStructuredData(injectMenuHtml(html, menu), menu);
      }

      if (html.includes(dashboardPizzasPlaceholder)) {
        return injectDashboardPizzas(html, menu);
      }

      return html;
    },
  };
}

export default defineConfig({
  plugins: [menuHtmlPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: indexPath,
        dashboard: dashboardPath,
      },
    },
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
