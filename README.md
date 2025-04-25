# Deploi AI Chat

An AI chatbot feature integrated into Deploi's website that works alongside users to provide real-time help through a natural chat interface. Built with Next.js and CopilotKit, it enables direct interaction with language models while incorporating rate limiting powered by rate-limiter-flexible.

![Deploi AI Chat Interface](/public/ui-image.png)

## Installation

```bash
# Clone repository
git clone https://github.com/Team-Deploi/Deploi-AIChat.git
cd Deploi-AIChat

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Environment Variables

To run this project, you need to set up the following environment variables:

- **GROQ_API_KEY**: Your Groq API key for accessing their AI models
  
Create a `.env.local` file in the root directory with the following format:

```
GROQ_API_KEY=your_groq_api_key_here
```

## Setting Up CopilotKit in an Existing Project

Follow these steps to integrate CopilotKit into your existing Next.js application (Pages Router):

> Note: For App Router implementation, refer to the [CopilotKit documentation](https://docs.copilotkit.ai/quickstart?copilot-hosting=self-hosted&endpoint-type=Next.js+App+Router&component=CopilotChat).

### 1. Install Required Packages

```bash
# Install CopilotKit packages
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime

# Install rate-limiter for API protection
npm install rate-limiter-flexible
```

### 2. Set Up CopilotKit Provider

Wrap your application with the CopilotKit provider in your `_app.js`:

```javascript
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

function MyApp({ Component, pageProps }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <Component {...pageProps} />
    </CopilotKit>
  );
}

export default MyApp;
```

### 3. Create the API Endpoint

Create a file at `pages/api/copilotkit.js`:

```javascript
import {
  CopilotRuntime,
  GroqAdapter,
  copilotRuntimeNextJSPagesRouterEndpoint,
} from "@copilotkit/runtime";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Initialize service adapter with Groq
const serviceAdapter = new GroqAdapter();

// Configure rate limiting
const rateLimiter = new RateLimiterMemory({
  points: 50,
  duration: 24 * 60 * 60, // 1 day in seconds
});

// Get client IP for rate limiting
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

  // Allow agent availability check without rate limiting
  if (req.body?.operationName === "availableAgents") {
    return await handleRequest(req, res);
  }

  // Apply rate limiting
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
```

### 4. Add a Chat Component to Your Page

Add the CopilotChat component to any page where you want to display the chat interface:

```javascript
import { CopilotChat } from "@copilotkit/react-ui";

export default function ChatPage() {
  return (
    <div className="flex h-screen w-full py-3">
      <CopilotChat
        className="h-full w-full"
        instructions="You are an AI assistant built for helping users understand their data."
        labels={{
          title: "Your Assistant",
          initial: "Hi! 👋 How can I assist you today?",
        }}
      />
    </div>
  );
}
```

### 5. Optional: Add Context-Awareness

Make your AI assistant aware of specific information:

```javascript
import { useCopilotReadable } from "@copilotkit/react-core";

// Inside your component
useCopilotReadable({
  description: "Current time",
  value: new Date().toLocaleTimeString(),
});
```

You can also add conditional instructions to control the AI assistant's behavior:

```javascript
import { useCopilotAdditionalInstructions } from "@copilotkit/react-core";
import { useState } from "react";

// Inside your component
const [featureFlag, setFeatureFlag] = useState(false);

useCopilotAdditionalInstructions(
  {
    instructions: "Do not answer questions about the weather.",
    available: featureFlag ? "enabled" : "disabled",
  },
  featureFlag
);
```

## References

- [CopilotKit Documentation](https://docs.copilotkit.ai/)
- [Groq API Keys](https://console.groq.com/keys)
- [rate-limiter-flexible NPM Package](https://www.npmjs.com/package/rate-limiter-flexible)
