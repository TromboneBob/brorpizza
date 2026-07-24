import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import type { Menu } from "./src/menuTypes";
import type { CateringMenu } from "./src/cateringMenuTypes";
import { renderDashboardPizzas, renderMenuItems } from "./src/renderMenu";
import { renderCateringMenuItems } from "./src/renderCateringMenu";
import { getFaqJsonLd, getRestaurantJsonLd } from "./src/structuredData";

const menuPath = fileURLToPath(new URL("./src/menu.json", import.meta.url));
const cateringMenuPath = fileURLToPath(new URL("./src/cateringMenu.json", import.meta.url));
const indexPath = fileURLToPath(new URL("./index.html", import.meta.url));
const cateringPath = fileURLToPath(new URL("./catering.html", import.meta.url));
const dashboardPath = fileURLToPath(
  new URL("./dashboard.html", import.meta.url),
);
const menuPlaceholder = "<!-- bror-menu-items -->";
const cateringPlaceholder = "<!-- bror-catering-menu-items -->";
const dashboardPizzasPlaceholder = "__BROR_DASHBOARD_PIZZAS__";

function readMenu() {
  return JSON.parse(readFileSync(menuPath, "utf8")) as Menu;
}

function readCateringMenu() {
  return JSON.parse(readFileSync(cateringMenuPath, "utf8")) as CateringMenu;
}

function toJsonLd(data: unknown) {
  return JSON.stringify(data, null, 2).replaceAll("</", "<\\/");
}

function injectMenuHtml(html: string, menu: Menu) {
  return html.replace(menuPlaceholder, renderMenuItems(menu));
}

function injectCateringHtml(html: string, catering: CateringMenu) {
  return html.replace(cateringPlaceholder, renderCateringMenuItems(catering));
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
      server.watcher.add(cateringMenuPath);
      server.watcher.on("change", (path) => {
        if (path === menuPath || path === cateringMenuPath) {
          server.ws.send({ type: "full-reload" });
        }
      });
    },
    transformIndexHtml(html: string) {
      if (html.includes(cateringPlaceholder)) {
        const catering = readCateringMenu();
        return injectCateringHtml(html, catering);
      }

      if (html.includes(menuPlaceholder)) {
        const menu = readMenu();
        return injectStructuredData(injectMenuHtml(html, menu), menu);
      }

      if (html.includes(dashboardPizzasPlaceholder)) {
        const menu = readMenu();
        return injectDashboardPizzas(html, menu);
      }

      return html;
    },
  };
}

export default defineConfig({
  plugins: [menuHtmlPlugin()],
  server:{
    allowedHosts:["weatherworn-vernice-occultly.ngrok-free.dev"]
},
  build: {
    rollupOptions: {
      input: {
        main: indexPath,
        dashboard: dashboardPath,
        catering: cateringPath,
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
