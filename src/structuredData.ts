import type { Menu } from "./menuTypes";

function getMenuPriceRange(menu: Menu) {
  const prices = menu.items.map((item) => item.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function getRestaurantJsonLd(menu: Menu) {
  const { min, max } = getMenuPriceRange(menu);

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": "https://brorpizza.no/#restaurant",
    name: "Bror",
    description:
      "Bror er en pop-up pizzarestaurant i Rosendal, Vestland. Vi lager håndstrakt surdeigspizza med langtidshevd deig og norske råvarer, inspirert av neapolitansk tradisjon. Takeaway fra Rosendal Samfunnshus.",
    url: "https://brorpizza.no/",
    email: "hei@brorpizza.no",
    servesCuisine: [
      "Pizza",
      "Surdeigspizza",
      "Neapolitansk pizza",
      "Italiensk",
      "Takeaway",
    ],
    priceRange: `${menu.currencyDisplay} ${min}–${max}`,
    currenciesAccepted: menu.currency,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rosendalsvegen 4",
      addressLocality: "Rosendal",
      postalCode: "5470",
      addressRegion: "Vestland",
      addressCountry: "NO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 60.0065,
      longitude: 6.0137,
    },
    potentialAction: {
      "@type": "ViewAction",
      target: "https://brorpizza.no/#meny",
      name: "Se meny",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: menu.label,
      itemListElement: menu.items.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "MenuItem",
          name: item.schemaName,
          description: item.schemaDescription,
          offers: {
            "@type": "Offer",
            price: String(item.price),
            priceCurrency: menu.currency,
          },
        },
      })),
    },
  };
}

export function getFaqJsonLd(menu: Menu) {
  const { min, max } = getMenuPriceRange(menu);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Når er Bror åpen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bror har ikke faste åpningstider. Sjekk nettsiden for oppdatert informasjon.",
        },
      },
      {
        "@type": "Question",
        name: "Hvor ligger Bror?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bror holder til i kjøkkenvinduet på Rosendal Samfunnshus, Rosendalsvegen 4, 5470 Rosendal, Vestland.",
        },
      },
      {
        "@type": "Question",
        name: "Tilbyr Bror takeaway?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, Bror tilbyr takeaway-pizza i Rosendal. Vi tar ikke bestillinger på telefon eller nett. Sjekk nettsiden brorpizza.no for åpningstider og stikk innom!",
        },
      },
      {
        "@type": "Question",
        name: "Hva slags pizza serverer Bror?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bror lager håndstrakt surdeigspizza inspirert av neapolitansk tradisjon. Deigen er langtidshevd og vi bruker i hovedsak norske råvarer.",
        },
      },
      {
        "@type": "Question",
        name: "Hva koster pizza på Bror?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Prisene ligger mellom ${menu.currencyDisplay} ${min} og ${menu.currencyDisplay} ${max} for en porsjonspizza.`,
        },
      },
      {
        "@type": "Question",
        name: "Er det pizza i Rosendal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, Bror på Rosendal Samfunnshus (Rosendalsvegen 4) serverer surdeigspizza i Rosendal.",
        },
      },
      {
        "@type": "Question",
        name: "Er det takeaway i Rosendal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, Bror tilbyr takeaway-pizza i Rosendal fra Rosendal Samfunnshus, Rosendalsvegen 4.",
        },
      },
      {
        "@type": "Question",
        name: "Fins det mat å ta med i Rosendal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, Bror tilbyr pizza å ta med (takeaway) i Rosendal på Rosendal Samfunnshus, Rosendalsvegen 4.",
        },
      },
      {
        "@type": "Question",
        name: "Where can I get pizza in Rosendal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bror serves handmade sourdough pizza in Rosendal, Norway, at Rosendal Samfunnshus, Rosendalsvegen 4, 5470 Rosendal. Takeaway only. Check brorpizza.no for current opening hours.",
        },
      },
      {
        "@type": "Question",
        name: "Is there takeaway food in Rosendal, Norway?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Bror offers takeaway pizza in Rosendal, Norway, at Rosendal Samfunnshus. Sourdough pizza made with Norwegian ingredients, inspired by Neapolitan tradition. Check brorpizza.no for current opening hours.",
        },
      },
      {
        "@type": "Question",
        name: "What food is available in Rosendal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Bror offers sourdough pizza takeaway in Rosendal at Rosendal Samfunnshus. Prices range from ${menu.currency} ${min} to ${menu.currency} ${max}. Check brorpizza.no for current opening hours.`,
        },
      },
    ],
  };
}
