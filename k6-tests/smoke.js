import http from "k6/http";
import { check, group, sleep } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
    checks: ["rate>0.95"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

function get(path) {
  return http.get(`${BASE_URL}${path}`, {
    tags: { name: path.split("?")[0] },
  });
}

export default function () {
  group("Public API smoke test", () => {
    const health = get("/api/healthz");
    check(health, {
      "healthz status is 200": (r) => r.status === 200,
    });

    const settings = get("/api/settings");
    check(settings, {
      "settings status is 200": (r) => r.status === 200,
    });

    const categories = get("/api/categories");
    check(categories, {
      "categories status is 200": (r) => r.status === 200,
      "categories returns array": (r) => Array.isArray(r.json()),
    });

    const products = get("/api/products?page=1&limit=12");
    check(products, {
      "products status is 200": (r) => r.status === 200,
      "products has items array": (r) => Array.isArray(r.json("items")),
    });

    const gallery = get("/api/gallery");
    check(gallery, {
      "gallery status is 200": (r) => r.status === 200,
    });

    if (products.status === 200) {
      const body = products.json();
      const firstProduct = body.items && body.items[0];

      if (firstProduct && firstProduct.slug) {
        const productDetail = get(`/api/products/by-slug/${firstProduct.slug}`);
        check(productDetail, {
          "product detail status is 200": (r) => r.status === 200,
        });
      }

      if (firstProduct && firstProduct.id) {
        const related = get(`/api/products/${firstProduct.id}/related`);
        check(related, {
          "related products status is 200": (r) => r.status === 200,
        });
      }
    }
  });

  sleep(1);
}
