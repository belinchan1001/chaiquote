/**
 * Load the English plan dictionary only after the visitor switches language.
 * Homepage Chinese traffic should not download plan-en.ts (~80 KB source).
 */
type Translate = (text: string) => string;

let translate: Translate | null = null;
let loading: Promise<Translate> | null = null;

export function toEnglishLazy(text: string): string {
  if (!text) return text;
  return translate ? translate(text) : text;
}

export function loadPlanEn(): Promise<Translate> {
  loading ??= import("./plan-en").then((mod) => {
    translate = mod.toEnglish;
    return mod.toEnglish;
  });
  return loading;
}
