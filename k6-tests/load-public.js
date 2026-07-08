import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 5 },
    { duration: "1m", target: 10 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
    checks: ["rate>0.95"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const paths = [
  "/api/healthz",
  "/api/settings",
  "/api/categories",
  "/api/products?page=1&limit=12",
  "/api/products?featured=true&limit=8",
  "/api/gallery",
];

export default function () {
  const path = paths[Math.floor(Math.random() * paths.length)];

  const res = http.get(`${BASE_URL}${path}`, {
    tags: { name: path.split("?")[0] },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 2s": (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
