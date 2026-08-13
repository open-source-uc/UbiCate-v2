import { check, sleep } from "k6";
import http from "k6/http";
import { Counter, Rate, Trend } from "k6/metrics";

const BASE = __ENV.BASE_URL || "http://localhost:3000";
const PEAK = Number(__ENV.PEAK_VUS) || 20000;
const RAMP = __ENV.RAMP || "10m";
const HOLD = __ENV.HOLD || "5m";
const POLL_SECONDS = Number(__ENV.POLL_SECONDS) || 300;

const notModified = new Rate("respuestas_304");
const bytesDownloaded = new Counter("bytes_bajados");
const placesLatency = new Trend("latencia_places", true);

export const options = {
  scenarios: {
    campus: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: RAMP, target: PEAK },
        { duration: HOLD, target: PEAK },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    "http_req_failed": ["rate<0.01"],
    "latencia_places": ["p(95)<1000"],
    "respuestas_304": ["rate>0.8"],
  },
};

function get(path, etag, extraHeaders) {
  const headers = Object.assign({}, extraHeaders);
  if (etag) headers["If-None-Match"] = etag;

  const res = http.get(`${BASE}${path}`, { headers, tags: { endpoint: path } });

  notModified.add(res.status === 304);
  bytesDownloaded.add(res.body ? res.body.length : 0);

  check(res, {
    "status 200 o 304": (r) => r.status === 200 || r.status === 304,
    "trae ETag": (r) => !!r.headers["Etag"],
  });

  return res.headers["Etag"] || etag;
}

export default function () {
  const state = { places: null, events: null, routes: null };

  const first = Date.now();
  state.places = get("/api/ubicate", null);
  placesLatency.add(Date.now() - first);

  state.events = get("/api/events", null);
  state.routes = get("/api/routes", null);

  state.places = get("/api/ubicate", null, { "X-Ubicate-Revalidate": "true" });

  for (let i = 0; i < 3; i++) {
    sleep(POLL_SECONDS);
    const t = Date.now();
    state.places = get("/api/ubicate", state.places);
    placesLatency.add(Date.now() - t);
    state.events = get("/api/events", state.events);
    state.routes = get("/api/routes", state.routes);
  }
}
