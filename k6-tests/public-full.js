import http from "k6/http";
import { check, group, sleep } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
    checks: ["rate>0.95"],
  },
};

const API_URL = __ENV.API_URL || "http://localhost:3000";
const WEB_URL = __ENV.WEB_URL || "http://localhost:5173";

export default function () {
  group("Public frontend pages", function () {
    const pages = [
      "/",
      "/about",
      "/categories",
      "/products",
      "/gallery",
      "/contact",
      "/inquiry",
    ];

    for (const page of pages) {
      const res = http.get(`${WEB_URL}${page}`, {
        tags: { name: `page:${page}` },
      });

      check(res, {
        [`${page} page is 200`]: (r) => r.status === 200,
        [`${page} page has html`]: (r) => String(r.body).includes("<html"),
      });
    }
  });

  group("Public API endpoints", function () {
    const health = http.get(`${API_URL}/api/healthz`);
    check(health, {
      "healthz is 200": (r) => r.status === 200,
    });

    const settings = http.get(`${API_URL}/api/settings`);
    check(settings, {
      "settings is 200": (r) => r.status === 200,
    });

    const categories = http.get(`${API_URL}/api/categories`);
    check(categories, {
      "categories is 200": (r) => r.status === 200,
      "categories returns array": (r) => Array.isArray(r.json()),
    });

    const products = http.get(`${API_URL}/api/products?page=1&limit=12`);
    check(products, {
      "products is 200": (r) => r.status === 200,
      "products returns items": (r) => Array.isArray(r.json("items")),
    });

    const featured = http.get(`${API_URL}/api/products?featured=true&limit=8`);
    check(featured, {
      "featured products is 200": (r) => r.status === 200,
    });

    const gallery = http.get(`${API_URL}/api/gallery`);
    check(gallery, {
      "gallery is 200": (r) => r.status === 200,
    });

    const productItems = products.status === 200 ? products.json("items") : [];
    const firstProduct = Array.isArray(productItems) ? productItems[0] : null;

    if (firstProduct?.slug) {
      const productPage = http.get(`${WEB_URL}/products/${firstProduct.slug}`, {
        tags: { name: "page:/products/:slug" },
      });

      check(productPage, {
        "product detail page is 200": (r) => r.status === 200,
      });

      const productApi = http.get(
        `${API_URL}/api/products/by-slug/${firstProduct.slug}`,
      );
      check(productApi, {
        "product by slug is 200": (r) => r.status === 200,
      });
    }

    if (firstProduct?.id) {
      const related = http.get(
        `${API_URL}/api/products/${firstProduct.id}/related`,
      );
      check(related, {
        "related products is 200": (r) => r.status === 200,
      });
    }

    const categoryItems = categories.status === 200 ? categories.json() : [];
    const firstCategory = Array.isArray(categoryItems)
      ? categoryItems[0]
      : null;

    if (firstCategory?.slug) {
      const categoryApi = http.get(
        `${API_URL}/api/categories/by-slug/${firstCategory.slug}`,
      );
      check(categoryApi, {
        "category by slug is 200": (r) => r.status === 200,
      });

      if (firstCategory?.id) {
        const categoryProducts = http.get(
          `${API_URL}/api/products?categoryId=${firstCategory.id}&page=1&limit=12`,
        );
        check(categoryProducts, {
          "products by category is 200": (r) => r.status === 200,
        });
      }
    }
  });

  sleep(1);
}
