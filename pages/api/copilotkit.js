import {
  CopilotRuntime,
  GroqAdapter,
  copilotRuntimeNextJSPagesRouterEndpoint,
} from "@copilotkit/runtime";
import { RateLimiterMemory } from "rate-limiter-flexible";

const serviceAdapter = new GroqAdapter({ model: "llama-3.3-70b-versatile" });

const rateLimiter = new RateLimiterMemory({
  points: 3, // Number of points (requests)
  duration: 24 * 60 * 60, // Time window in seconds (1 day)
});

const getClientIP = (req) => {
  return (
    req.headers["x-real-ip"] ||
    (req.headers["x-forwarded-for"]
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : null) ||
    req.socket?.remoteAddress ||
    "unknown"
  );
};

const handler = async (req, res) => {
  const runtime = new CopilotRuntime();

  const handleRequest = copilotRuntimeNextJSPagesRouterEndpoint({
    endpoint: "/api/copilotkit",
    runtime,
    serviceAdapter,
  });

  if (req.body?.operationName === "availableAgents") {
    return await handleRequest(req, res);
  }

  const clientIp = getClientIP(req);

  try {
    await rateLimiter.consume(clientIp);
  } catch (rateLimiterRes) {
    res.setHeader("Retry-After", Math.ceil(rateLimiterRes.msBeforeNext / 1000));
    res.setHeader("X-RateLimit-Limit", rateLimiter.points);
    res.setHeader("X-RateLimit-Remaining", rateLimiterRes.remainingPoints);
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil((Date.now() + rateLimiterRes.msBeforeNext) / 1000)
    );
    return res.status(429).json({ error: "Too Many Requests" });
  }

  return await handleRequest(req, res);
};

export default handler;
