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
        h1: ({ node, ...restProps }) => <h1 className="text-xl font-bold my-4" {...restProps} />,
        h2: ({ node, ...restProps }) => <h2 className="text-lg font-bold my-3" {...restProps} />,
        h3: ({ node, ...restProps }) => <h3 className="text-md font-bold my-2" {...restProps} />,
        a: ({ node, ...props }) => (
          <a
            {...props}
            className="text-success underline"
            target="_blank"
            rel="noopener noreferrer"
          />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside my-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside my-2" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-info pl-4 italic my-2"
            {...props}
          />
        ),
        hr: ({ node, ...props }) => (
          <hr
            className="border-t-2 border-brown-light my-4 w-full"
            {...props}
          />
        ),
      }}
    >
      {props.children}
    </ReactMarkdown>
  );
}

export default MarkDownComponent;
