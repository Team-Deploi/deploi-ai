import { prompt } from "@/lib/prompt";
import { useCopilotReadable } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";

export default function Index() {
  useCopilotReadable({
    description: "Current time",
    value: new Date().toLocaleTimeString(),
  });
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
