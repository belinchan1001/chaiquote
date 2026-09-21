export function newsShareUrl(path: string) {
  return path.startsWith("http") ? path : `https://www.chaiquote.hk${path}`;
}

export function newsShareText(title: string, url: string) {
  return `${title}\n${url}`;
}

export function newsWhatsAppHref(title: string, url: string) {
  return `https://wa.me/?text=${encodeURIComponent(newsShareText(title, url))}`;
}

export async function shareOrCopyNews(
  title: string,
  url: string,
  host: {
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data: ShareData) => boolean;
    writeText?: (text: string) => Promise<void>;
  } = {},
): Promise<"shared" | "copied" | "aborted" | "failed"> {
  const payload: ShareData = { title, text: title, url };
  const share = host.share ?? (typeof navigator !== "undefined" ? navigator.share?.bind(navigator) : undefined);
  const canShare = host.canShare ?? (typeof navigator !== "undefined" ? navigator.canShare?.bind(navigator) : undefined);
  const writeText =
    host.writeText ??
    (typeof navigator !== "undefined" ? navigator.clipboard?.writeText.bind(navigator.clipboard) : undefined);

  if (share && (!canShare || canShare(payload))) {
    try {
      await share(payload);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "aborted";
      if (error instanceof Error && error.name === "AbortError") return "aborted";
    }
  }

  if (!writeText) return "failed";
  try {
    await writeText(newsShareText(title, url));
    return "copied";
  } catch {
    return "failed";
  }
}
