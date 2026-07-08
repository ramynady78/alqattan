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

function jsonHeaders() {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
}

function post(path, body) {
  return http.post(`${API_URL}${path}`, JSON.stringify(body), jsonHeaders());
}

function patch(path, body) {
  return http.patch(`${API_URL}${path}`, JSON.stringify(body), jsonHeaders());
}

function resolveUploadUrl(uploadURL) {
  if (String(uploadURL).startsWith("http")) return uploadURL;
  return `${API_URL}${uploadURL}`;
}

export default function () {
  let originalSettings = null;
  let objectPath = null;

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

  group("Debug endpoint", function () {
    const debug = http.get(`${API_URL}/api/_debug`);

    check(debug, {
      "debug is 200": (r) => r.status === 200,
      "debug has env": (r) => Boolean(r.json("nodeEnv")),
    });
  });

  group("Settings safe update and restore", function () {
    const getSettings = http.get(`${API_URL}/api/settings`);

    check(getSettings, {
      "get settings is 200": (r) => r.status === 200,
      "settings has hero title": (r) => typeof r.json("heroTitle") === "string",
    });

    originalSettings = getSettings.json();

    const testTagline = `${originalSettings.brandTagline || "K6"} - K6 TEST`;

    const updateSettings = patch("/api/settings", {
      brandTagline: testTagline,
    });

    check(updateSettings, {
      "patch settings is 200": (r) => r.status === 200,
      "brandTagline updated": (r) => r.json("brandTagline") === testTagline,
    });

    const restoreSettings = patch("/api/settings", {
      brandTagline: originalSettings.brandTagline,
    });

    check(restoreSettings, {
      "restore settings is 200": (r) => r.status === 200,
      "brandTagline restored": (r) =>
        r.json("brandTagline") === originalSettings.brandTagline,
    });
  });

  group("Storage upload flow", function () {
    const fileContent = "K6 upload test file for Alqattan";
    const contentType = "text/plain";

    const requestUrl = post("/api/storage/uploads/request-url", {
      name: "k6-test.txt",
      size: fileContent.length,
      contentType,
    });

    check(requestUrl, {
      "request upload url is 200": (r) => r.status === 200,
      "uploadURL exists": (r) => Boolean(r.json("uploadURL")),
      "objectPath exists": (r) => Boolean(r.json("objectPath")),
    });

    const uploadURL = requestUrl.json("uploadURL");
    objectPath = requestUrl.json("objectPath");

    if (uploadURL && objectPath) {
      const uploadTarget = resolveUploadUrl(uploadURL);

      const upload = http.put(uploadTarget, fileContent, {
        headers: {
          "Content-Type": contentType,
        },
      });

      check(upload, {
        "upload file is 200": (r) => r.status === 200,
      });

      const readObject = http.get(`${API_URL}/api/storage${objectPath}`);

      check(readObject, {
        "read uploaded object is 200": (r) => r.status === 200,
        "uploaded object content matches": (r) => r.body === fileContent,
      });
    }
  });

  group("Logout", function () {
    const logout = http.post(`${API_URL}/api/auth/logout`);

    check(logout, {
      "logout is 204": (r) => r.status === 204,
    });
  });

  sleep(1);
}
