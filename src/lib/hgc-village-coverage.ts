/**
 * HGC village fibre coverage as listed May 2026.
 * Used to hide HGC village plans on village addresses outside this set,
 * and to hide HKBN village plans on addresses inside this set
 * (HGC fibre here means HKBN village fibre is not listed).
 * Site IDs stay internal; do not show them on the site.
 */
import { compact, ESTATES, matchKnownEstate } from "./estates.ts";

export type HgcVillage = {
  id: string;
  name: string;
  nameEn: string;
  district: string;
  area: string;
};

const RAW = `
VIL523|九華徑|Kau Wa Keng|葵青|葵涌
VIL3056|清潭路元崗新村|Tsing Tam Rd Yuen Kong San Tsuen|元朗|八鄉
VIL785|攸潭美(二)|Yau Tam Mei (2)|元朗|新田
VIL783|大生圍|Tai Sang Wai|元朗|新田
VIL1288|上村 - 石頭圍|Sheung Tsuen - Shek Tau Wai|元朗|八鄉
VIL784|攸潭美(一)|Yau Tam Mei (1)|元朗|新田
VIL781|下灣村|Ha Wan Tsuen|元朗|新田
VIL107|落馬洲|Lok Ma Chau|元朗|新田
VIL720|渡頭灣|To Tau Wan Village|沙田|馬鞍山
VIL683|獅頭嶺|Sze Tau Leng|北區|粉嶺
VIL490|畫眉山|Wa Mei Shan|北區|粉嶺
VIL488|丹竹坑|Tan Chuk Hang|北區|沙頭角
VIL486|新屋仔|San Uk Tsai|北區|沙頭角
VIL567|塘肚|Tong To|北區|沙頭角
VIL550|麻雀嶺|Mat Tseuk Leng|北區|沙頭角
VIL572|烏石角|Wu Shek Kok|北區|沙頭角
VIL646|馬灣涌|Ma Wan Chung|離島|東涌
VIL1057|麻雀嶺新屋下|Mat Tseuk Leng San Uk Ha|北區|沙頭角
VIL1197|落馬洲新村|Lok Ma Chau San Tsuen|元朗|新田
VIL1094|瓦窰頭|Nga Yiu Tau|北區|沙頭角
VIL762|雷公田村|Lui Kung Tin|元朗|八鄉
VIL460|元嶺葉屋|Yuen Leng Yip Uk|大埔|大埔
VIL483|馬尾下嶺咀|Ma Mei Ha Leng Tsui|北區|沙頭角
VIL478|嶺皮村|Leng Pei Tsuen|北區|沙頭角
VIL482|馬尾下|Ma Mei Ha|北區|沙頭角
VIL565|大塘湖|Tai Tong Wu|北區|沙頭角
VIL569|橫山腳新村|Wang Shan Keuk|北區|沙頭角
VIL693|羅湖|Lo Wu|北區|上水
VIL189|木湖瓦窰|Muk Wu Nga Yiu|北區|上水
VIL696|得月樓|Tak Yuet Lau|北區|上水
VIL694|瓦窰下|Nga Yiu Ha|北區|上水
VIL473|簡頭村|Kan Tau Tsuen|北區|沙頭角
VIL570|禾坑大朗|Wo Hang Tai Long|北區|沙頭角
VIL459|元嶺李屋|Yuen Leng Lee Uk|大埔|大埔
VIL87|洲頭村|Chau Tau Tsuen|元朗|新田
VIL573|鹽灶下|Yim Tso Ha|北區|沙頭角
VIL1284|馬灣大街村南|Ma Wan Main Street Village South|荃灣|馬灣
VIL561|山咀|Shan Tsui|北區|沙頭角
VIL1175|大坳門|Tai Au Mun|西貢|西貢
VIL538|雞谷樹下|Kai Kuk Shue Ha|北區|沙頭角
VIL1282|馬灣大街村東|Ma Wan Main Street Village East|荃灣|馬灣
VIL1295|稔埔村|Nim Po Tsuen|離島|梅窩
VIL1283|馬灣漁民村|Ma Wan Fishermen|荃灣|馬灣
VIL474|高莆|Ko Po|北區|沙頭角
VIL562|石橋頭村|Shek Kiu Tau|北區|沙頭角
VIL1301|上村|Sheung Tsuen|元朗|八鄉
VIL1162|白石窩新村|Pak Shek Wo San Tsuen|西貢|西貢
VIL199|新屋嶺|San Uk Ling|北區|粉嶺
VIL1098|南邊圍|Nam Bin Wai|離島|梅窩
VIL485|新塘莆|San Tong Po|北區|沙頭角
VIL729|犁壁山|Lai Pek Shan|大埔|大埔
VIL657|黃泥屋|Wong Nai Uk|離島|東涌
VIL1185|南坑尾|Nam Hang Mei|北區|沙頭角
VIL1305|膊頭下|Pok Tau Ha|北區|沙頭角
VIL571|烏蛟騰|Wu Kau Tang|北區|沙頭角
VIL415|磡頭角|San Tau Kok|大埔|大埔
VIL1161|萬景台|Man King Terrace|西貢|西貢
VIL1062|打鼓嶺村|Ta Kwu Ling Village|北區|打鼓嶺
VIL548|鹿頸陳屋|Luk Keng Chan Uk|北區|沙頭角
VIL549|鹿頸黃屋|Luk Keng Wong Uk|北區|沙頭角
VIL196|木湖|Muk Wu|北區|上水
VIL566|上担水坑|Sheung Tam Shui Hang|北區|沙頭角
VIL560|沙頭角新村|San Tsuen|北區|沙頭角
VIL563|上禾坑|Sheung Wo Hang|北區|沙頭角
VIL142|八鄉大窩|Tai Wo|元朗|八鄉
VIL708|普通道(西)|Po Tung Road (West)|西貢|西貢
VIL737|營盤下竹坑|Ying Pun Ha Chuk Hang|大埔|大埔
VIL702|西貢正街(西)|Sai Kung Main Street (West)|西貢|西貢
VIL709|西貢道(北)|Sai Kung Road (North)|西貢|西貢
VIL515|木棉下|Muk Min Ha Tsuen|荃灣|荃灣
VIL1286|沙江圍仔|Sha Kong Wai Tsai|元朗|流浮山
VIL763|彭家村|Pang Ka Tsuen|元朗|八鄉
VIL517|西樓角|Sai Lau Kok Tsuen|荃灣|荃灣
VIL201|大埔田|Tai Po Tin|北區|打鼓嶺
VIL1108|上村 - 杜屋村|Sheung Tsuen - To Uk Tsuen|元朗|八鄉
VIL1129|下担水坑|Ha Tam Shui Hang|北區|沙頭角
VIL710|西貢道(南)|Sai Kung Road (South)|西貢|西貢
VIL125|永隆圍|Wing Lung Wai|元朗|錦田
VIL399|蓮澳鄭屋|Lin Au Cheng Uk|大埔|大埔
VIL701|西貢正街(東)|Sai Kung Main Street (East)|西貢|西貢
VIL216|大環頭|Tai Wan Tau|西貢|西貢
VIL756|馬閃排|Ma Sim Pai|荃灣|荃灣
VIL135|牛徑|Ngau Keng|元朗|八鄉
VIL1101|井頭新村|Tseng Tau San Tsuen|離島|梅窩
VIL400|蓮澳李屋|Lin Au Lei Uk|大埔|大埔
VIL751|亦園村|Yick Yuen Tsuen|屯門|屯門
VIL717|德隆前街|Tak Lung Front Street|西貢|西貢
VIL127|七星崗|Tsat Sing Kong|元朗|錦田
VIL1247|石崗新村|Shek Kong San Tsuen|元朗|八鄉
VIL1246|坪輋新村|Ping Che New Village|北區|打鼓嶺
VIL1245|黃崗山村|Wong Kong Shan|北區|粉嶺
VIL537|下禾坑|Ha Wo Hang|北區|沙頭角
VIL1118|橫台山新村|Wang Toi Shan San Tsuen|元朗|八鄉
VIL1093|蕉坑|Tsiu Hang|北區|沙頭角
VIL1268|永寧新村|Wing Ning San Tsuen|元朗|錦田
VIL1061|昇平村|Sing Ping Village|北區|打鼓嶺
VIL1105|上村 - 屋頭村|Sheung Tsuen - Uk Tau Tsuen|元朗|八鄉
VIL551|萬屋邊|Man Uk Pin|北區|沙頭角
VIL29|金錢圍|Kam Tsin Wai|元朗|八鄉
VIL1138|華盛村|Wah Shing Tsuen|元朗|錦田
VIL692|下山雞乙|Ha Shan Kai Wat|北區|打鼓嶺
VIL117|祠堂村|Tsz Tong Tsuen|元朗|錦田
VIL119|錦田市|Kam Tin Shi|元朗|錦田
VIL138|水流田|Shui Lau Tsuen|元朗|八鄉
VIL23|田心舊村|Tin Sum Tsuen|元朗|八鄉
VIL1119|橫台山散村|Wang Toi Shan Shan Tsuen|元朗|八鄉
VIL700|海傍街|Hoi Pong Street|西貢|西貢
VIL1318|龍鼓灘沙埔崗|Lung Kwu Tan Sha Po Kong|屯門|屯門
VIL1237|下洋新村|Ha Yeung San Tsuen|西貢|西貢
VIL714|西貢大街(東)|Sai Kung Tai Street (East)|西貢|西貢
VIL535|凹下|Au Ha|北區|沙頭角
VIL716|德隆後街|Tak Lung Back Street|西貢|西貢
VIL27|石湖塘|Shek Wu Tong|元朗|八鄉
VIL479|嶺仔|Leng Tsai|北區|沙頭角
VIL1060|坪輋隔田|Ping Che Kat Tin|北區|打鼓嶺
VIL396|九龍坑老圍|Kau Lung Hang Lo Wai|大埔|大埔
VIL1117|橫台山邱屋村|Wang Toi Shan Yau Uk Tsuen|元朗|八鄉
VIL191|鳳凰湖|Fung Wong Wu|北區|打鼓嶺
VIL419|新屋排|San Uk Pai|大埔|大埔
VIL25|長莆|Cheung Po|元朗|八鄉
VIL197|坪輋|Ping Che|北區|打鼓嶺
VIL1059|坪輋元下|Yuen Ha Tsuen Ping Che|北區|打鼓嶺
VIL496|荃灣新村|San Tsuen|荃灣|荃灣
VIL577|馬灣大街村中|Ma Wan Main Street Village|荃灣|馬灣
VIL120|高埔村|Ko Po Tsuen|元朗|錦田
VIL51|鳳降村|Fung Kong Tsuen|元朗|廈村
VIL108|壆圍|Pok Wai|元朗|新田
VIL1084|龍躍頭覲龍村|Lung Yeuk Tau Kan Lung Tsuen|北區|粉嶺
VIL202|塘坊|Tong Fong|北區|打鼓嶺
VIL131|下輦|Ha Che|元朗|八鄉
VIL80|楊小坑|Yeung Siu Hang|屯門|屯門
VIL194|李屋|Lei Uk Village|北區|打鼓嶺
VIL198|坪洋|Ping Yeung|北區|打鼓嶺
VIL116|逢吉鄉|Fung Kat Heung|元朗|新田
VIL1281|馬灣大街村北|Ma Wan Main Street Village North|荃灣|馬灣
VIL1137|模範鄉|Mo Fan Heung|元朗|新田
VIL22|吉慶圍|Kat Hing Wai|元朗|錦田
VIL124|泰康圍|Tai Hong Wai|元朗|錦田
VIL546|蓮麻坑|Lin Ma Hang|北區|打鼓嶺
VIL170|楊屋村嘉樂園|Yeung Uk Tsuen|元朗|元朗
VIL1113|橫台山永寧里|Wang Toi Shan Wing Ning Lei|元朗|八鄉
VIL1085|龍躍頭新圍|Lung Yeuk Tau San Wai|北區|粉嶺
VIL291|九肚村|Kau To Village|沙田|火炭
VIL1244|塘坑東村|Tong Hang Tung Chuen|北區|粉嶺
VIL134|馬鞍崗|Ma On Kong|元朗|八鄉
VIL331|黃竹洋|Wong Chuk Yeung|沙田|火炭
VIL555|木棉頭|Muk Min Tau|北區|沙頭角
VIL1210|下香園|Ha Heung Yuen|北區|打鼓嶺
VIL626|大地塘|Tai Tei Tong|離島|梅窩
VIL26|河背村|Ho Pui Tsuen|元朗|八鄉
VIL1103|上村 - 張屋村|Sheung Tsuen - Cheung Uk Tsuen|元朗|八鄉
VIL133|蓮花地|Lin Fa Tei|元朗|八鄉
VIL297|馬料|Ma Niu Village|沙田|火炭
VIL1110|上村 - 曾屋村|Sheung Tsuen - Tsang Uk Tsuen|元朗|八鄉
VIL193|簡頭圍|Kan Tai Wai|北區|打鼓嶺
VIL203|松園下|Tsung Yuen Ha|北區|打鼓嶺
VIL218|井欄樹|Tseng Lan Shue|西貢|西貢
VIL195|老鼠嶺週田村|Chow Tin Tsuen Lo Shue Ling|北區|打鼓嶺
VIL139|水盞田|Shui Tsan Tin|元朗|八鄉
VIL92|新慶村|San Hing Tsuen|元朗|流浮山
VIL137|上村新村|Sheung Tsuen San Tsuen|元朗|八鄉
VIL190|竹園|Chuk Yuen Village|北區|打鼓嶺
VIL838|九龍坑新圍|Kau Lung Hang San Wai|大埔|大埔
VIL24|吳家村|Ng Ka Tsuen|元朗|錦田
VIL192|香園圍|Heung Yuen Wai|北區|打鼓嶺
VIL28|田心新村|Tin Sam San Tsuen|元朗|八鄉
VIL93|沙江圍|Sha Kong Wai|元朗|流浮山
VIL624|白銀鄉|Pak Ngan Heung|離島|梅窩
VIL121|沙埔村|Sha Po Tsuen|元朗|錦田
VIL144|元崗村|Yuen Kong Tsuen|元朗|八鄉
VIL445|大埔大窩|Tai Wo|大埔|大埔
VIL1097|新龍圍|Sun Lung Wai|離島|梅窩
VIL346|輦下|Che Ha|大埔|大埔
VIL-lkt-nam|龍鼓灘南朗|Lung Kwu Tan Nam Long|屯門|屯門
VIL66|龍鼓灘北朗|Lung Kwu Tan Pak Long|屯門|屯門
VIL749|青山村|Tsing Shan Tsuen|屯門|屯門
VIL1107|上村 - 北邊村|Sheung Tsuen - Pak Pin Tsuen|元朗|八鄉
VIL130|新隆圍|San Lung Wai|元朗|八鄉
VIL618|鹿地塘|Luk Tei Tong|離島|梅窩
VIL1109|上村 - 南慶里|Sheung Tsuen - Nam Hing Lei|元朗|八鄉
VIL582|田寮|Tin Liu|荃灣|馬灣
VIL715|西貢大街(西)|Sai Kung Tai Street (West)|西貢|西貢
VIL1056|白田新村|Pak Tin New Village|北區|沙頭角
VIL707|普通道(東)|Po Tung Road (East)|西貢|西貢
VIL741|河田村|Ho Tin Tsuen|屯門|屯門
VIL703|萬宜灣新村|Man Yee Wan New Village|西貢|西貢
VIL147|竹坑村|Chuk Hang|元朗|八鄉
VIL1111|上村 - 謝屋村|Sheung Tsuen - Tse Uk Tsuen|元朗|八鄉
VIL1099|麻布村|Ma Po Tsuen|離島|梅窩
VIL91|鰲磡村|Ngau Hom Tsuen|元朗|流浮山
VIL621|梅窩舊村|Mui Wo Kau Tsuen|離島|梅窩
VIL1120|橫台山河瀝背村|Wang Toi Shan Lo Lik Pui|元朗|八鄉
VIL747|井頭中村及下(頌皇台)|Tseng Tau Chung Tsuen|屯門|屯門
VIL141|大亹|Tai Kek|元朗|八鄉
VIL1198|下灣漁民新村|Ha Wan Fisherman San Tsuen|元朗|新田
VIL1116|橫台山羅屋村|Wang Toi Shan Lo Uk Tsuen|元朗|八鄉
VIL1106|上村 - 中心村|Sheung Tsuen - Chung Sum Tsuen|元朗|八鄉
VIL145|元崗新村|Yuen Kong San Tsuen|元朗|八鄉
VIL132|梁屋村|Leung Uk Tsuen|元朗|八鄉
VIL740|福亨村(上)|Fuk Hang Tsuen Sheung|屯門|屯門
VIL1285|田寮新村|Tin Liu New Village|荃灣|馬灣
VIL695|上山雞乙|Sheung Shan Kai Wat|北區|打鼓嶺
VIL1112|上村 - 黎屋村|Sheung Tsuen - Lai Uk Tsuen|元朗|八鄉
VIL516|白田壩|Pak Tin Pa Tsuen|荃灣|荃灣
VIL1083|龍躍頭新屋村|Lung Yeuk Tau San Uk Tsuen|北區|粉嶺
VIL126|錦田新村|Kam Tin Shing Mun San Tsuen|元朗|錦田
VIL755|海壩(南台)|Hoi Pa Village South Terrace|荃灣|荃灣
VIL1199|較寮村|Kaw Liu Village|北區|打鼓嶺
VIL1102|上村 - 門口仔|Sheung Tsuen - Mun Hau Tsai|元朗|八鄉
VIL1064|海壩(東北台)|Hoi Pa Village Northeast Terrace|荃灣|荃灣
VIL1104|上村 - 祠堂村|Sheung Tsuen - Tsz Tong Tsuen|元朗|八鄉
VIL719|亞公角漁民新村|Ah Kung Kok Fishermen Village|沙田|沙田
`.trim();

const ALIASES: Record<string, string[]> = {
  "攸潭美(一)": ["攸潭尾", "攸潭美"],
  "攸潭美(二)": ["攸潭尾", "攸潭美"],
  木棉下: ["木棉下村"],
  白田壩: ["白田壩村"],
  井欄樹: ["井欄樹村"],
  海傍街: ["西貢海傍街"],
  田心舊村: ["八鄉田心"],
  元崗村: ["元崗"],
  高埔村: ["高埔", "錦田高埔"],
  鹿地塘: ["梅窩鹿地塘"],
  田寮: ["馬灣田寮村"],
  "海壩(南台)": ["海壩南台"],
  "海壩(東北台)": ["海壩東北台"],
  上村: ["八鄉上村"],
  吉慶圍: ["錦田吉慶圍"],
  永隆圍: ["錦田永隆圍"],
  蓮花地: ["八鄉蓮花地"],
  新慶村: ["廈村新慶村"],
  竹坑村: ["八鄉竹坑"],
  洲頭村: ["洲頭"],
  馬灣涌: ["東涌馬灣涌"],
  河背村: ["八鄉河背"],
  瓦窰頭: ["沙頭角瓦窰頭"],
};

function parseRow(line: string): HgcVillage {
  const [id, name, nameEn, district, area] = line.split("|");
  return { id, name, nameEn, district, area };
}

export const HGC_VILLAGE_COVERAGE: readonly HgcVillage[] = RAW.split("\n").filter(Boolean).map(parseRow);

function nameVariants(row: HgcVillage): string[] {
  const names = [row.name, ...(ALIASES[row.name] ?? [])];
  const hamlet = row.name.replace(/^上村\s*[-–]?\s*/, "").trim();
  if (hamlet && hamlet !== row.name) names.push(hamlet, `上村${hamlet}`, `上村 - ${hamlet}`);
  const noParen = row.name.replace(/[（(].*$/, "").trim();
  if (noParen && noParen !== row.name) names.push(noParen);
  return [...new Set(names.filter(Boolean))];
}

function chineseKeys(estate: { name: string; aliases: string[] }): Set<string> {
  return new Set(
    [estate.name, ...estate.aliases.filter((alias) => /[\u4e00-\u9fff]/.test(alias))].map((item) => compact(item)),
  );
}

function scoreEstate(
  row: HgcVillage,
  estate: { name: string; aliases: string[]; district: string; area?: string },
): number {
  const keys = chineseKeys(estate);
  let score = 0;
  for (const variant of nameVariants(row)) {
    const key = compact(variant);
    if (key && keys.has(key)) score = Math.max(score, 100);
  }
  if (!score) return 0;
  if (estate.district === row.district) score += 15;
  if (estate.area && (estate.area === row.area || compact(estate.area) === compact(row.area))) score += 10;
  return score;
}

const VILLAGE_BY_KEY = new Map<string, { name: string; aliases: string[]; district: string; area?: string }[]>();
for (const estate of ESTATES) {
  if (estate.housing !== "village") continue;
  const keys = chineseKeys(estate);
  for (const key of keys) {
    if (!key) continue;
    const hit = { name: estate.name, aliases: estate.aliases, district: estate.district, area: estate.area };
    const list = VILLAGE_BY_KEY.get(key);
    if (list) list.push(hit);
    else VILLAGE_BY_KEY.set(key, [hit]);
  }
}

function matchRow(row: HgcVillage) {
  let best: { name: string; score: number } | undefined;
  const seen = new Set<string>();
  for (const variant of nameVariants(row)) {
    const key = compact(variant);
    const hits = key ? VILLAGE_BY_KEY.get(key) : undefined;
    if (!hits) continue;
    for (const estate of hits) {
      if (seen.has(estate.name)) continue;
      seen.add(estate.name);
      const score = scoreEstate(row, estate);
      if (score >= 100 && (!best || score > best.score)) best = { name: estate.name, score };
    }
  }
  return best;
}

const HGC_MATCHES = HGC_VILLAGE_COVERAGE.map((row) => ({ row, hit: matchRow(row) }));

export const HGC_VILLAGE_MATCHED_ESTATES: readonly string[] = [
  ...new Set(
    HGC_MATCHES.map((item) => item.hit?.name).filter((name): name is string => Boolean(name)),
  ),
];

export const HGC_VILLAGE_UNMATCHED: readonly HgcVillage[] = HGC_MATCHES.filter((item) => !item.hit).map(
  (item) => item.row,
);

const UNLOCK_KEYS = new Set<string>();
for (const row of HGC_VILLAGE_COVERAGE) {
  for (const variant of nameVariants(row)) UNLOCK_KEYS.add(compact(variant));
}
for (const name of HGC_VILLAGE_MATCHED_ESTATES) UNLOCK_KEYS.add(compact(name));

/**
 * HGC village plans stay on the generic village list (no address yet).
 * With an address, only the May 2026 coverage set unlocks them.
 */
export function estateHasHgcVillageCoverage(estateQuery: string | undefined): boolean {
  const raw = estateQuery?.trim();
  if (!raw) return true;
  const q = compact(raw);
  if (!q) return false;
  const known = matchKnownEstate(raw);
  if (known) {
    if (HGC_VILLAGE_MATCHED_ESTATES.includes(known.name)) return true;
    // Listed HGC name more specific than the catalogue parent, e.g. 馬灣涌 vs 馬灣.
    if (UNLOCK_KEYS.has(q) && q !== compact(known.name)) return true;
    return false;
  }
  return UNLOCK_KEYS.has(q);
}

/**
 * HKBN village plans stay on the generic village list (no address yet).
 * A named village on the HGC May 2026 list does not list HKBN village fibre.
 */
export function estateBlocksHkbnVillage(estateQuery: string | undefined): boolean {
  const raw = estateQuery?.trim();
  if (!raw) return false;
  return estateHasHgcVillageCoverage(raw);
}
