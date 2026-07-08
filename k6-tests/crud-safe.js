import http from "k6/http";
import { check, group, sleep } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ["rate>0.95"],
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<2000"],
  },
};

const API_URL = __ENV.API_URL || "http://localhost:3000";

const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || "admin@alqattan.sa";
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || "AlQattan2026!";

function headers() {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
}

function post(path, body) {
  return http.post(`${API_URL}${path}`, JSON.stringify(body), headers());
}

function patch(path, body) {
  return http.patch(`${API_URL}${path}`, JSON.stringify(body), headers());
}

function del(path) {
  return http.del(`${API_URL}${path}`);
}

export default function () {
  const stamp = Date.now();

  let categoryId = null;
  let productId = null;
  let inquiryId = null;
  let galleryId = null;

  group("Admin login", function () {
    const login = post("/api/auth/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    check(login, {
      "login is 200": (r) => r.status === 200,
      "login has admin id": (r) => Boolean(r.json("id")),
    });
  });

  group("Category CRUD", function () {
    const createCategory = post("/api/categories", {
      name: `تصنيف اختبار K6 ${stamp}`,
      nameEn: `K6 Test Category ${stamp}`,
      slug: `k6-test-category-${stamp}`,
      description: "تصنيف مؤقت لاختبار K6",
      imageUrl: "/api/static/placeholder.svg",
      sortOrder: 9999,
    });

    check(createCategory, {
      "create category is 201": (r) => r.status === 201,
      "created category has id": (r) => Boolean(r.json("id")),
    });

    categoryId = createCategory.json("id");

    if (categoryId) {
      const updateCategory = patch(`/api/categories/${categoryId}`, {
        name: `تصنيف اختبار K6 محدث ${stamp}`,
        nameEn: `Updated K6 Test Category ${stamp}`,
        slug: `k6-test-category-updated-${stamp}`,
        description: "تم تحديث التصنيف أثناء اختبار K6",
        imageUrl: "/api/static/placeholder.svg",
        sortOrder: 9998,
      });

      check(updateCategory, {
        "update category is 200": (r) => r.status === 200,
        "updated category name changed": (r) =>
          String(r.json("name")).includes("محدث"),
      });
    }
  });

  group("Product CRUD", function () {
    const createProduct = post("/api/products", {
      name: `منتج اختبار K6 ${stamp}`,
      nameEn: `K6 Test Product ${stamp}`,
      slug: `k6-test-product-${stamp}`,
      description: "منتج مؤقت لاختبار K6",
      specs: "مقاس تجريبي - لون تجريبي",
      price: 99,
      priceText: "99 ريال",
      categoryId,
      images: ["/api/static/placeholder.svg"],
      isFeatured: false,
      isAvailable: true,
    });

    check(createProduct, {
      "create product is 201": (r) => r.status === 201,
      "created product has id": (r) => Boolean(r.json("id")),
    });

    productId = createProduct.json("id");

    if (productId) {
      const updateProduct = patch(`/api/products/${productId}`, {
        name: `منتج اختبار K6 محدث ${stamp}`,
        nameEn: `Updated K6 Test Product ${stamp}`,
        slug: `k6-test-product-updated-${stamp}`,
        description: "تم تحديث المنتج أثناء اختبار K6",
        specs: "مواصفات محدثة",
        price: 120,
        priceText: "120 ريال",
        categoryId,
        images: ["/api/static/placeholder.svg"],
        isFeatured: true,
        isAvailable: true,
      });

      check(updateProduct, {
        "update product is 200": (r) => r.status === 200,
        "updated product price is 120": (r) => Number(r.json("price")) === 120,
      });
    }
  });

  group("Public inquiry + admin update", function () {
    const createInquiry = post("/api/inquiries", {
      name: `عميل اختبار K6 ${stamp}`,
      phone: "0500000000",
      email: `k6-${stamp}@test.com`,
      message: "هذه رسالة اختبار من K6",
      items: productId
        ? [
            {
              productId,
              productName: `منتج اختبار K6 ${stamp}`,
              quantity: 1,
            },
          ]
        : [],
    });

    check(createInquiry, {
      "create inquiry is 201": (r) => r.status === 201,
      "created inquiry has id": (r) => Boolean(r.json("id")),
    });

    inquiryId = createInquiry.json("id");

    if (inquiryId) {
      const updateInquiry = patch(`/api/inquiries/${inquiryId}`, {
        status: "contacted",
      });

      check(updateInquiry, {
        "update inquiry is 200": (r) => r.status === 200,
        "inquiry status contacted": (r) => r.json("status") === "contacted",
      });
    }
  });

  group("Gallery CRUD", function () {
    const createGallery = post("/api/gallery", {
      title: `صورة اختبار K6 ${stamp}`,
      description: "عنصر معرض مؤقت لاختبار K6",
      imageUrl: "/api/static/placeholder.svg",
      sortOrder: 9999,
    });

    check(createGallery, {
      "create gallery is 201": (r) => r.status === 201,
      "created gallery has id": (r) => Boolean(r.json("id")),
    });

    galleryId = createGallery.json("id");

    if (galleryId) {
      const updateGallery = patch(`/api/gallery/${galleryId}`, {
        title: `صورة اختبار K6 محدثة ${stamp}`,
        description: "تم تحديث عنصر المعرض أثناء اختبار K6",
        imageUrl: "/api/static/placeholder.svg",
        sortOrder: 9998,
      });

      check(updateGallery, {
        "update gallery is 200": (r) => r.status === 200,
        "updated gallery title changed": (r) =>
          String(r.json("title")).includes("محدثة"),
      });
    }
  });

  group("Cleanup test data", function () {
    if (galleryId) {
      const deleteGallery = del(`/api/gallery/${galleryId}`);
      check(deleteGallery, {
        "delete gallery is 204": (r) => r.status === 204,
      });
    }

    if (inquiryId) {
      const deleteInquiry = del(`/api/inquiries/${inquiryId}`);
      check(deleteInquiry, {
        "delete inquiry is 204": (r) => r.status === 204,
      });
    }

    if (productId) {
      const deleteProduct = del(`/api/products/${productId}`);
      check(deleteProduct, {
        "delete product is 204": (r) => r.status === 204,
      });
    }

    if (categoryId) {
      const deleteCategory = del(`/api/categories/${categoryId}`);
      check(deleteCategory, {
        "delete category is 204": (r) => r.status === 204,
      });
    }
  });

  sleep(1);
}
