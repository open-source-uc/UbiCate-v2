import dynamic from "next/dynamic";

import React from "react";

import remarkGfm from "remark-gfm";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

function MarkDownComponent(props: { children: string }) {
  return (
    <ReactMarkdown
      className="text-white-ubi text-prose dark:prose-invert p-2"
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...restProps }) => <h1 className="text-xl font-bold my-1" {...restProps} />,
        h2: ({ node, ...restProps }) => <h2 className="text-lg font-bold my-0.5" {...restProps} />,
        h3: ({ node, ...restProps }) => <h3 className="text-md font-bold" {...restProps} />,
        a: ({ node, ...props }) => (
          <a {...props} className="text-success underline" target="_blank" rel="noopener noreferrer" />
        ),
        ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-info pl-4 italic my-2" {...props} />
        ),
        hr: ({ node, ...props }) => <hr className="border-t-2 border-brown-light my-4 w-full" {...props} />,
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-white/20 rounded-md text-sm text-left">{props.children}</table>
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-white/10 backdrop-blur-sm text-white font-semibold">{props.children}</thead>
        ),
        tbody: ({ node, ...props }) => <tbody className="divide-y divide-white/10">{props.children}</tbody>,
        tr: ({ node, ...props }) => <tr className="hover:bg-white/5" {...props} />,
        th: ({ node, ...props }) => <th className="px-4 py-2 border-b border-white/20" {...props} />,
        td: ({ node, ...props }) => <td className="px-4 py-2 border-b border-white/10" {...props} />,
      }}
    >
      {props.children}
    </ReactMarkdown>
  );
}

export default MarkDownComponent;
