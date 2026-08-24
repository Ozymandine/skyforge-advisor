// src/hooks/use-share.ts
// Social sharing helper: uses the native Web Share API when available,
// otherwise falls back to copying text to the clipboard.

import { useCallback, useState } from "react";

export function useShare() {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async (title: string, text: string) => {
    const payload = { title, text, url: window.location.href };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return true;
      } catch {
        // User cancelled or share failed — fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(`${title}
${text}
${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { share, copied };
}
