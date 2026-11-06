import { Fragment } from "react";

import type { PolicyBlock, PolicyInline } from "@/lib/legal/privacy-policy";

function TextWithBreaks({ text }: { text: string }) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

function InlineContent({ parts }: { parts: PolicyInline[] }) {
  return parts.map((part, index) => {
    if (typeof part === "string") return <TextWithBreaks key={index} text={part} />;

    if (part.href) {
      const external = !part.href.startsWith("#");
      return (
        <a
          key={index}
          href={part.href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="font-medium break-words text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
        >
          {part.text}
        </a>
      );
    }

    return (
      <strong key={index} className="font-semibold text-ink">
        {part.text}
      </strong>
    );
  });
}

function Block({ block }: { block: PolicyBlock }) {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2
          id={block.id}
          className="scroll-mt-6 pt-6 text-lg font-semibold tracking-tight text-ink"
        >
          {block.text}
        </h2>
      ) : (
        <h3 id={block.id} className="scroll-mt-6 pt-2 text-base font-semibold text-ink">
          {block.text}
        </h3>
      );
    case "paragraph":
      return (
        <p id={block.id} className="scroll-mt-6">
          <InlineContent parts={block.content} />
        </p>
      );
    case "list": {
      const items = block.items.map((item, index) => (
        <li key={index}>
          <InlineContent parts={item} />
        </li>
      ));
      return block.ordered ? (
        <ol
          start={block.start}
          className="list-decimal space-y-2 pl-6 marker:font-semibold marker:text-ink"
        >
          {items}
        </ol>
      ) : (
        <ul className="list-disc space-y-1.5 pl-6 marker:text-ink-muted">{items}</ul>
      );
    }
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-xl border-collapse text-left">
            <thead className="bg-surface-muted">
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} className="border-b border-line px-3 py-2 font-semibold text-ink">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]} className="border-b border-line last:border-b-0">
                  {row.map((cell, index) => (
                    <td key={index} className="px-3 py-2 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function PolicyDocument({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
