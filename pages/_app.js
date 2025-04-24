import "@/styles/globals.css";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Deploi AI Chat</title>
      </Head>
      <CopilotKit runtimeUrl="/api/copilotkit">
        <Component {...pageProps} />
      </CopilotKit>
    </>
  );
}
