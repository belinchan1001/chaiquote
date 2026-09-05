import type { Housing } from "@/lib/plans";

export type Estate = {
  name: string;
  aliases: string[];
  district: string;
  housing: Housing;
  area?: string;
};

const RAW = `
華富邨|華富,Wah Fu|南區|public
華貴邨|華貴,Wah Kwai|南區|public
利東邨|利東,Lei Tung|南區|public
石排灣邨|石排灣,Shek Pai Wan|南區|public
鴨脷洲邨|鴨脷洲,Ap Lei Chau Estate|南區|public
漁灣邨|漁灣,Yue Wan|東區|public
小西灣邨|小西灣,Siu Sai Wan|東區|public
興東邨|興東,Hing Tung|東區|public
愛東邨|愛東,Oi Tung|東區|public
興華邨|興華,Hing Wah|東區|public
柴灣邨|柴灣,Chai Wan Estate|東區|public
健康村|北角健康村,Healthy Village|東區|public
模範邨|模範,Model Housing|東區|public
西環邨|西環,Sai Wan Estate|中西區|public
觀塘邨|觀塘,Kwun Tong Estate|觀塘|public
秀茂坪邨|秀茂坪,Sau Mau Ping|觀塘|public
順天邨|順天,Shun Tin|觀塘|public
順安邨|順安,Shun On|觀塘|public
牛頭角上邨|牛頭角上,Upper Ngau Tau Kok|觀塘|public
牛頭角下邨|牛頭角下,Lower Ngau Tau Kok|觀塘|public
彩霞邨|彩霞,Choi Ha|觀塘|public
啟業邨|啟業,Kai Yip|觀塘|public
坪石邨|坪石,Ping Shek|觀塘|public
彩虹邨|彩虹,Choi Hung|黃大仙|public
黃大仙下邨|黃大仙下,Lower Wong Tai Sin|黃大仙|public
黃大仙上邨|黃大仙上,Upper Wong Tai Sin|黃大仙|public
竹園北邨|竹園北,Chuk Yuen North|黃大仙|public
竹園南邨|竹園南,Chuk Yuen South|黃大仙|public
慈雲山邨|慈雲山,Tsz Wan Shan|黃大仙|public
慈樂邨|慈樂,Tsz Lok|黃大仙|public
東頭邨|東頭,Tung Tau|黃大仙|public
樂富邨|樂富,Lok Fu|黃大仙|public
彩雲邨|彩雲,Choi Wan|黃大仙|public
橫頭磡邨|橫頭磡,Wang Tau Hom|黃大仙|public
石硤尾邨|石硤尾,Shek Kip Mei|深水埗|public
白田邨|白田,Pak Tin|深水埗|public
李鄭屋邨|李鄭屋,Lei Cheng Uk|深水埗|public
蘇屋邨|蘇屋,So Uk|深水埗|public
長沙灣邨|長沙灣,Cheung Sha Wan Estate|深水埗|public
南山邨|南山,Nam Shan|深水埗|public
麗閣邨|麗閣,Lai Kok|深水埗|public
海麗邨|海麗,Hoi Lai|深水埗|public
紅磡邨|紅磡,Hung Hom Estate|九龍城|public
何文田邨|何文田,Ho Man Tin Estate|九龍城|public
愛民邨|愛民,Oi Man|九龍城|public
馬頭圍邨|馬頭圍,Ma Tau Wai|九龍城|public
樂民新村|樂民,Lok Man|九龍城|public
彩虹道邨|彩虹道|黃大仙|public
大坑東邨|大坑東,Tai Hang Tung|深水埗|public
大坑西邨|大坑西,Tai Hang Sai|深水埗|public
梨木樹邨|梨木樹,Lei Muk Shue|荃灣|public
象山邨|象山,Cheung Shan|荃灣|public
福來邨|福來,Fuk Loi|荃灣|public
葵芳邨|葵芳,Kwai Fong|葵青|public
葵盛東邨|葵盛東,Kwai Shing East|葵青|public
葵盛西邨|葵盛西,Kwai Shing West|葵青|public
葵涌邨|葵涌,Kwai Chung Estate|葵青|public
石籬邨|石籬,Shek Lei|葵青|public
石蔭邨|石蔭,Shek Yam|葵青|public
安蔭邨|安蔭,On Yam|葵青|public
長安邨|長安,Cheung On|葵青|public
長康邨|長康,Cheung Hong|葵青|public
長青邨|長青,Cheung Ching|葵青|public
長亨邨|長亨,Cheung Hang|葵青|public
青衣邨|青衣,Tsing Yi Estate|葵青|public
長發邨|長發,Cheung Fat|葵青|public
安定邨|安定,On Ting|屯門|public
友愛邨|友愛,Yau Oi|屯門|public
山景邨|山景,Shan King|屯門|public
大興邨|大興,Tai Hing|屯門|public
良景邨|良景,Leung King|屯門|public
田景邨|田景,Tin King|屯門|public
寶田邨|寶田,Po Tin|屯門|public
富泰邨|富泰,Fu Tai|屯門|public
欣田邨|欣田,Yan Tin|屯門|public
兆康苑|兆康,Siu Hong Court|屯門|hos
天耀邨|天耀,Tin Yiu|元朗|public|天水圍
天瑞邨|天瑞,Tin Shui|元朗|public|天水圍
天慈邨|天慈,Tin Tsz|元朗|public|天水圍
天華邨|天華,Tin Wah|元朗|public|天水圍
天恩邨|天恩,Tin Yan|元朗|public|天水圍
天恒邨|天恒,Tin Heng|元朗|public|天水圍
天逸邨|天逸,Tin Yat|元朗|public|天水圍
天晴邨|天晴,Tin Ching|元朗|public|天水圍
天澤邨|天澤,Tin Chak|元朗|public|天水圍
天悅邨|天悅,Tin Yuet|元朗|public|天水圍
朗屏邨|朗屏,Long Ping|元朗|public
水邊圍邨|水邊圍,Shui Pin Wai|元朗|public
天水圍北|天水圍,Tin Shui Wai North|元朗|public|天水圍
天富苑|天富,Tin Fu Court|元朗|hos|天水圍
天盛苑|天盛,Tin Shing Court|元朗|hos|天水圍
天愛苑|天愛,Tin Oi Court|元朗|hos|天水圍
天晉|天晉,The Wings|西貢|private|將軍澳
將軍澳中心|將軍澳中心,Park Central|西貢|private|將軍澳
東港城|東港城,East Point City|西貢|private|將軍澳
新都城|新都城,Metro City|西貢|private|將軍澳
慧安園|慧安園,Well On Garden|西貢|hos|將軍澳
廣明苑|廣明,Kwong Ming Court|西貢|hos|將軍澳
廣明苑|廣明苑|西貢|hos|將軍澳
厚德邨|厚德,Hau Tak|西貢|public|將軍澳
明德邨|明德,Ming Tak|西貢|public|將軍澳
景林邨|景林,King Lam|西貢|public|將軍澳
寶林邨|寶林,Po Lam|西貢|public|將軍澳
翠林邨|翠林,Tsui Lam|西貢|public|將軍澳
坑口邨|坑口,Hang Hau|西貢|public|將軍澳
健明邨|健明,Kin Ming|西貢|public|將軍澳
善明邨|善明,Shin Ming|西貢|public|將軍澳
彩明苑|彩明,Choi Ming Court|西貢|hos|將軍澳
沙田第一城|第一城,City One|沙田|private
沙田中心|沙田中心,Shatin Centre|沙田|private
新城市廣場|新城市,New Town Plaza|沙田|private
沙田圍|沙田圍,Sha Tin Wai|沙田|public
瀝源邨|瀝源,Lek Yuen|沙田|public
禾輋邨|禾輋,Wo Che|沙田|public
廣源邨|廣源,Kwong Yuen|沙田|public
廣林苑|廣林,Kwong Lam Court|沙田|hos
顯徑邨|顯徑,Hin Keng|沙田|public
秦石邨|秦石,Chun Shek|沙田|public
新田圍邨|新田圍,Sun Tin Wai|沙田|public
美林邨|美林,Mei Lam|沙田|public
美田邨|美田,Mei Tin|沙田|public
圓洲角|圓洲角,Yuen Chau Kok|沙田|public
馬鞍山中心|馬鞍山中心,Ma On Shan Centre|沙田|private|馬鞍山
耀安邨|耀安,Yiu On|沙田|public|馬鞍山
恆安邨|恆安,Heng On|沙田|public|馬鞍山
錦英苑|錦英,Kam Ying Court|沙田|hos|馬鞍山
富安花園|富安,Chevalier Garden|沙田|private|馬鞍山
大埔中心|大埔中心,Tai Po Centre|大埔|private
太和邨|太和,Tai Wo|大埔|public
富亨邨|富亨,Fu Heng|大埔|public
富善邨|富善,Fu Shin|大埔|public
廣福邨|廣福,Kwong Fuk|大埔|public
大元邨|大元,Tai Yuen|大埔|public
運頭塘邨|運頭塘,Wan Tau Tong|大埔|public
寶湖花園|寶湖,Treasure Garden|大埔|private
粉嶺中心|粉嶺中心,Fanling Centre|北區|private
華明邨|華明,Wah Ming|北區|public
祥華邨|祥華,Cheung Wah|北區|public
嘉福邨|嘉福,Ka Fuk|北區|public
清河邨|清河,Ching Ho|北區|public
天平邨|天平,Tin Ping|北區|public
彩園邨|彩園,Choi Yuen|北區|public
上水匯|上水匯,Sheung Shui Town Centre|北區|private
太古城|太古城,Taikoo Shing|東區|private
康怡花園|康怡,Kornhill|東區|private
杏花邨|杏花邨,Heng Fa Chuen|東區|private
嘉亨灣|嘉亨灣,Grand Promenade|東區|private
南豐新邨|南豐新邨,Nam Fung Sun Chuen|東區|private
鰂魚涌|鰂魚涌,Quarry Bay|東區|private
北角匯|北角匯,Harbour North|東區|private
城市花園|城市花園,City Garden|東區|private
和富中心|和富,Provident Centre|東區|private
炮台山|炮台山,Fortress Hill|東區|private
寶馬山|寶馬山,Braemar Hill|東區|private
半山區|半山,Mid-Levels|中西區|private
西半山|西半山,Western Mid-Levels|中西區|private
堅尼地城|堅尼地城,Kennedy Town|中西區|private
西營盤|西營盤,Sai Ying Pun|中西區|private
薄扶林花園|薄扶林,Pokfulam Gardens|南區|private
置富花園|置富,Chi Fu Fa Yuen|南區|private
貝沙灣|貝沙灣,Residence Bel-Air|南區|private
深灣軒|深灣軒,Sham Wan Towers|南區|private
黃埔花園|黃埔,Whampoa Garden|九龍城|private
海逸豪園|海逸豪園,Laguna Verde|九龍城|private
翔龍灣|翔龍灣,The Coronation|油尖旺|private
奧海城|奧海城,Olympian City|油尖旺|private
君匯港|君匯港,Harbour Green|油尖旺|private
浪澄灣|浪澄灣,The Long Beach|油尖旺|private
維港灣|維港灣,Island Harbourview|油尖旺|private
大角咀|大角咀,Tai Kok Tsui|油尖旺|private
旺角中心|旺角中心,Argyle Centre|油尖旺|private
美孚新邨|美孚,Mei Foo Sun Chuen|深水埗|private
碧海藍天|碧海藍天,Aqua Marine|深水埗|private
宇晴軒|宇晴軒,The Pacifica|深水埗|private
昇悅居|昇悅居,Banyan Garden|深水埗|private
海麗|海麗商場|深水埗|public
又一村|又一村,Yau Yat Tsuen|深水埗|private
九龍塘|九龍塘,Kowloon Tong|九龍城|private
廣播道|廣播道,Broadcast Drive|九龍城|private
何文田山道|何文田山|九龍城|private
麗港城|麗港城,Laguna City|觀塘|private
匯景花園|匯景,Sceneway Garden|觀塘|private
德福花園|德福,Telford Gardens|觀塘|private
淘大花園|淘大,Amoy Gardens|觀塘|private
麗晶花園|麗晶,Richland Gardens|觀塘|private
啟德|啟德新區,Kai Tak|九龍城|private
啟德1號|啟德1號|九龍城|private
天水圍嘉湖山莊|嘉湖,嘉湖山莊,Kingswood Villas|元朗|private|天水圍
俊宏軒|俊宏軒,Central Park Towers|元朗|private|天水圍
慧景軒|慧景軒,Central Park|元朗|private|天水圍
濕地公園路|濕地公園|元朗|private|天水圍
YOHO Town|YOHO,Yoho Town,元朗YOHO|元朗|private
YOHO Midtown|YOHO Midtown|元朗|private
形點|形點,Yoho Mall|元朗|private
加州花園|加州花園,Palm Springs|元朗|private
錦繡花園|錦繡花園,Fairview Park|元朗|private
新時代廣場|屯門市廣場,Tuen Mun Town Plaza|屯門|private
瓏門|瓏門,The Palazzo TM|屯門|private
愛琴灣|愛琴灣,Aegean Coast|屯門|private
掃管笏|掃管笏,So Kwun Wat|屯門|private
黃金海岸|黃金海岸,Gold Coast|屯門|private
荃灣中心|荃灣中心,Tsuen Wan Centre|荃灣|private
綠楊新邨|綠楊,Luk Yeung Sun Chuen|荃灣|private
灣景花園|灣景花園,Belvedere Garden|荃灣|private
海濱花園|海濱花園,Riviera Gardens|荃灣|private
荃灣廣場|荃灣廣場|荃灣|private
大窩口邨|大窩口,Tai Wo Hau|葵青|public
葵翠邨|葵翠,Kwai Tsui|葵青|public
葵聯邨|葵聯,Kwai Luen|葵青|public
長亨|長亨邨|葵青|public
青衣城|青衣城,Maritime Square|葵青|private
灝景灣|灝景灣,Villa Esplanada|葵青|private
藍澄灣|藍澄灣,Tierra Verde|葵青|private
盈翠半島|盈翠,Nerine Cove|葵青|private
東涌逸東邨|逸東,Yat Tung|離島|public|東涌
滿東邨|滿東,Mun Tung|離島|public|東涌
裕東苑|裕東,Yu Tung Court|離島|hos|東涌
東堤灣畔|東堤灣畔,Caribbean Coast|離島|private|東涌
映灣園|映灣園,Seaview Crescent|離島|private|東涌
藍天海岸|藍天海岸,Coastal Skyline|離島|private|東涌
珀麗灣|珀麗灣,Park Island|離島|private|馬灣
愉景灣|愉景灣,Discovery Bay|離島|private
南丫島|南丫,Lamma|離島|village
長洲|長洲,Cheung Chau|離島|village
坪洲|坪洲,Peng Chau|離島|village
大澳|大澳,Tai O|離島|village
梅窩|梅窩,Mui Wo|離島|village
廈村|廈村,Ha Tsuen|元朗|village
屏山|屏山,Ping Shan|元朗|village
洪水橋|洪水橋,Hung Shui Kiu|元朗|village
流浮山|流浮山,Lau Fau Shan|元朗|village
錦田|錦田,Kam Tin|元朗|village
八鄉|八鄉,Pat Heung|元朗|village
石崗|石崗,Shek Kong|元朗|village
新田|新田,San Tin|元朗|village
米埔|米埔,Mai Po|元朗|village
大埔林村|林村,Lam Tsuen|大埔|village
大埔泮涌|泮涌,Pun Chung|大埔|village
西貢北潭涌|北潭涌,Pak Tam Chung|西貢|village
西貢海傍街|西貢市,Sai Kung Town|西貢|village
西貢匡湖居|匡湖居,Marina Cove|西貢|private
西貢澳南|澳南,Ao Nan|西貢|village
清水灣|清水灣,Clear Water Bay|西貢|private
坑口村|坑口村|西貢|village
南圍|南圍,Nam Wai|西貢|village
蠔涌|蠔涌,Ho Chung|西貢|village
大網仔|大網仔,Tai Mong Tsai|西貢|village
馬鞍山烏溪沙|烏溪沙,Wu Kai Sha|沙田|private
西沙路|西沙,Sai Sha|沙田|village
沙田火炭|火炭,Fo Tan|沙田|private
大圍美田|大圍,Tai Wai|沙田|private
居屋麗港城|麗港居屋|觀塘|hos
居屋寶達邨|寶達,Po Tat|觀塘|public
寶達邨|寶達邨,Po Tat Estate|觀塘|public
順利邨|順利,Shun Lee|觀塘|public
順緻苑|順緻,Shun Chi Court|觀塘|hos
居屋彩德邨|彩德,Choi Tak|觀塘|public
彩福邨|彩福,Choi Fook|觀塘|public
啟田邨|啟田,Kai Tin|觀塘|public
藍田邨|藍田,Lam Tin Estate|觀塘|public
廣田邨|廣田,Kwong Tin|觀塘|public
德田邨|德田,Tak Tin|觀塘|public
平田邨|平田,Ping Tin|觀塘|public
油塘邨|油塘,Yau Tong Estate|觀塘|public
油麗邨|油麗,Yau Lai|觀塘|public
鯉魚門邨|鯉魚門,Lei Yue Mun Estate|觀塘|public
居屋鯉安苑|鯉安苑,Lei On Court|觀塘|hos
康山花園|康山,Kornhill Gardens|東區|private
居屋逸東|逸東居屋|離島|hos
天水圍天華|天華|元朗|public|天水圍
馬灣|馬灣,Ma Wan|荃灣|village|馬灣
井欄樹村|井欄樹,Tseng Lan Shue|西貢|village
木棉下村|木棉下,Muk Min Ha|荃灣|village
荃灣新村|荃灣新村|荃灣|village
白田壩村|白田壩,Pak Tin Pa|荃灣|village
馬閃排|馬閃排,Ma Sim Pai|荃灣|village
海壩東北台|海壩東北,Hoi Pa|荃灣|village
西樓角|西樓角,Sai Lau Kok|荃灣|village
海壩南台|海壩南台|荃灣|village
下洋新村|下洋新村,Ha Yeung San Tsuen|西貢|village
大坳門|大坳門,Tai Au Mun|西貢|village
`.trim();

export const ESTATES: Estate[] = RAW.split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [name, aliasStr, district, housing, area] = line.split("|");
    return {
      name,
      aliases: (aliasStr ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      district,
      housing: housing as Housing,
      area: area || undefined,
    };
  })
  .filter((item, index, list) => list.findIndex((x) => x.name === item.name) === index);

export function compact(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function searchEstates(query: string, limit = 8): Estate[] {
  const q = compact(query);
  if (!q) return [];
  const scored = ESTATES.map((estate) => {
    const hay = [estate.name, estate.area ?? "", estate.district, ...estate.aliases].map(compact);
    let score = 0;
    if (hay[0] === q) score = 100;
    else if (hay[0].startsWith(q)) score = 80;
    else if (hay.some((h) => h.startsWith(q))) score = 60;
    else if (hay.some((h) => h.includes(q))) score = 40;
    return { estate, score };
  }).filter((row) => row.score > 0);
  scored.sort((a, b) => b.score - a.score || a.estate.name.localeCompare(b.estate.name, "zh-Hant"));
  return scored.slice(0, limit).map((row) => row.estate);
}

export function estateLabel(estate: Estate) {
  const place = estate.area ?? estate.district;
  const type =
    estate.housing === "public"
      ? "公屋"
      : estate.housing === "hos"
        ? "居屋"
        : estate.housing === "village"
          ? "村屋"
          : "私人樓";
  return `${place} · ${type}`;
}
