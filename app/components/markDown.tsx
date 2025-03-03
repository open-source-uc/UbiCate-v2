import dynamic from "next/dynamic";

import React from "react";

import remarkGfm from "remark-gfm";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

function MarkDownComponent(props: { children: string }) {
  return (
    <ReactMarkdown
      className="text-white-ubi text-prose p-2 dark:prose-invert"
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...restProps }) => <h1 className="text-3xl font-bold my-4" {...restProps} />,
        h2: ({ node, ...restProps }) => <h2 className="text-2xl font-bold my-3" {...restProps} />,
        h3: ({ node, ...restProps }) => <h3 className="text-xl font-bold my-2" {...restProps} />,
        // Agrega más niveles si lo requieres
      }}
    >
      {props.children}
    </ReactMarkdown>
  );
}

export default MarkDownComponent;
