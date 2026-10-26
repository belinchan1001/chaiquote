import type { Housing } from "@/lib/plans";
// TEMP: full content with 5 new estates will be updated
const RAW = `
翔東邨|翔東,Cheung Tung,Cheung Tung Estate|離島|public|東涌
雋東邨|雋東,Chun Tung,Chun Tung Estate|離島|public|東涌
鳳凰嶺邨|鳳凰嶺,Fung Wong Leng,Fung Wong Leng Estate|北區|public|粉嶺
曉茵邨|曉茵,Hiu Yan,Hiu Yan Estate|觀塘|public
滿田邨|滿田,Moon Tin,Moon Tin Estate|屯門|public
`.trim();
export const ESTATES = [];
