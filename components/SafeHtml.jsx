"use client";
import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

export default function SafeHtml({ html = "", sx, className }) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_TAGS: ["iframe", "audio", "video", "source"],
        ADD_ATTR: [
          "allow",
          "allowfullscreen",
          "frameborder",
          "scrolling",
          "controls",
          "src",
          "type",
          "poster",
          "muted",
          "playsinline",
        ],
      }),
    [html]
  );

  return (
    <div
      className={`safe-html ${className || ""}`}
      style={sx}
      // برای اجتناب از اخطارهای ریز هیدریشن وقتی افزونه‌ها DOM را تغییر می‌دهند
      suppressHydrationWarning
    >
      <style jsx>{`
        :global(.safe-html table) {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
          font-size: 16px;
        }
        :global(.safe-html th),
        :global(.safe-html td) {
          border: 1px solid #e5e7eb;
          padding: 8px 10px;
        }
        :global(.safe-html th) {
          background: #f3f4f6;
          font-weight: 800;
          text-align: center;
        }
        :global(.safe-html tr:nth-child(even) td) {
          background: #fafafa;
        }
        :global(.safe-html a) {
          color: #2477f3;
          text-decoration: underline;
        }
        :global(.safe-html iframe),
        :global(.safe-html video),
        :global(.safe-html audio) {
          display: block;
          max-width: 100%;
          margin: 10px auto;
          border-radius: 8px;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: clean }} />
    </div>
  );
}
