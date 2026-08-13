import { check } from "k6";
import http from "k6/http";
import { Trend } from "k6/metrics";

const BASE = __ENV.BASE_URL || "http://localhost:3000";
const BURST = Number(__ENV.BURST) || 200;

const loadLatency = new Trend("latencia_carga", true);

export const options = {
  scenarios: {
    burst: {
      executor: "shared-iterations",
      vus: BURST,
      iterations: BURST,
      maxDuration: "2m",
    },
  },
};

export default function () {
  const started = Date.now();
  const res = http.get(`${BASE}/api/ubicate`, {
    headers: { "X-Ubicate-Fresh": "true" },
  });
  loadLatency.add(Date.now() - started);

  check(res, {
    "status 200": (r) => r.status === 200,
    "trae ETag": (r) => !!r.headers["Etag"],
  });

  console.log(`${res.headers["Etag"]}`);
}
