import { ProxyAgent, setGlobalDispatcher } from "undici";

const proxyUrl = process.env.OUTBOUND_PROXY;

if (!proxyUrl) {
  console.warn("[proxy] No proxy configured. Traffic will go direct.");
} else {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  console.log(`[proxy] Global proxy set → ${proxyUrl}`);
}
