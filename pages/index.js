import {
  useCopilotAdditionalInstructions,
  useCopilotReadable,
} from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useState } from "react";

const prompt = `
You are an AI assistant built for helping users understand their data.

When you give a report about data, be sure to use markdown formatting and tables
to make it easy to understand.

Try to communicate as briefly as possible to the user unless they ask for more information.
`;

export default function Index() {
  const [showWeather, setShowWeather] = useState(false);

  useCopilotReadable({
    description: "Current time",
    value: new Date().toLocaleTimeString(),
  });

  useCopilotAdditionalInstructions(
    {
      instructions: "Do not answer questions about the weather.",
      available: showWeather ? "enabled" : "disabled",
    },
    showWeather
  );
  return (
    <div className="flex h-screen w-full py-3">
      <CopilotChat
        className="h-full w-full"
        instructions={prompt}
        labels={{
          title: "Your Assistant",
          initial: "Hi! 👋 How can I assist you today?",
        }}
      />
    </div>
  );
}
