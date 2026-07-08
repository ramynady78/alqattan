import http from "k6/http";
import { check, group, sleep } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<2000"],
    checks: ["rate>0.90"],
  },
};

const API_URL = __ENV.API_URL || "http://localhost:3000";
const WEB_URL = __ENV.WEB_URL || "http://localhost:5173";

const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || "admin@alqattan.sa";
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || "AlQattan2026!";

function jsonHeaders() {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
}

export default function () {
  group("Admin frontend pages", function () {
    const adminPages = [
      "/admin/login",
      "/admin",
      "/admin/categories",
      "/admin/products",
      "/admin/gallery",
      "/admin/inquiries",
      "/admin/settings",
    ];

    for (const page of adminPages) {
      const res = http.get(`${WEB_URL}${page}`, {
        tags: { name: `admin-page:${page}` },
      });

      check(res, {
        [`${page} page is 200`]: (r) => r.status === 200,
        [`${page} returns html`]: (r) => String(r.body).includes("<html"),
      });
    }
  });

  group("Admin login", function () {
    const loginRes = http.post(
      `${API_URL}/api/auth/login`,
      JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
      jsonHeaders(),
    );

    check(loginRes, {
      "login status is 200": (r) => r.status === 200,
      "login returns admin id": (r) => Boolean(r.json("id")),
      "login returns email": (r) => Boolean(r.json("email")),
    });
  });

  group("Admin protected API", function () {
    const me = http.get(`${API_URL}/api/auth/me`);
    check(me, {
      "auth me is 200": (r) => r.status === 200,
      "auth me has admin": (r) => Boolean(r.json("id")),
    });

    const stats = http.get(`${API_URL}/api/admin/stats`);
    check(stats, {
      "admin stats is 200": (r) => r.status === 200,
      "stats has products count": (r) =>
        typeof r.json("productsCount") === "number",
      "stats has categories count": (r) =>
        typeof r.json("categoriesCount") === "number",
      "stats has inquiries count": (r) =>
        typeof r.json("inquiriesCount") === "number",
    });

    const inquiries = http.get(`${API_URL}/api/inquiries`);
    check(inquiries, {
      "inquiries is 200": (r) => r.status === 200,
      "inquiries returns array": (r) => Array.isArray(r.json()),
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

    const gallery = http.get(`${API_URL}/api/gallery`);
    check(gallery, {
      "gallery is 200": (r) => r.status === 200,
      "gallery returns array": (r) => Array.isArray(r.json()),
    });
  });

  group("Admin logout", function () {
    const logout = http.post(`${API_URL}/api/auth/logout`);
    check(logout, {
      "logout is 204": (r) => r.status === 204,
    });

    const meAfterLogout = http.get(`${API_URL}/api/auth/me`);
    check(meAfterLogout, {
      "auth me after logout is 200": (r) => r.status === 200,
      "auth me after logout is null": (r) => r.body === "null",
    });
  });

  sleep(1);
}
