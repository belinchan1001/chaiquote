import type { Housing } from "@/lib/plans";
import { districtEnglishName } from "./district-names.ts";
import { EXTRA_RAW } from "./estate-extra-raw.ts";
import { PRH_BLOCKS_RAW } from "./estate-prh-blocks-raw.ts";
import { MESSAGES, type Locale, type MessageKey } from "./messages.ts";
import { VILLAGE_RAW } from "./estate-village-raw.ts";
import { toTraditional } from "./zh-s2t.ts";

export type Estate = {
  name: string;
  aliases: string[];
  district: string;
  housing: Housing;
  area?: string;
  /** Rebuilding / demolished / coverage unknown — UI may only say 覆蓋需查核. */
  coverageCheck?: boolean;
  /** Street / door plate, used for display and address matching. */
  street?: string;
};

const HOUSING_VALUES: Housing[] = ["public", "hos", "private", "village"];

function isKnownHousing(value: string): value is Housing {
  return HOUSING_VALUES.includes(value as Housing);
}

const RAW = `
華富邨|華富,華富一邨,華富二邨,Wah Fu,Wah Fu Estate|南區|public
華貴邨|華貴,Wah Kwai,Wah Kwai Estate|南區|public
利東邨|利東,Lei Tung,Lei Tung Estate|南區|public
石排灣邨|石排灣,Shek Pai Wan,Shek Pai Wan Estate|南區|public
鴨脷洲邨|鴨脷洲,Ap Lei Chau Estate|南區|public
漁灣邨|漁灣,Yue Wan,Yue Wan Estate|東區|public
小西灣邨|小西灣,Siu Sai Wan,Siu Sai Wan Estate|東區|public
興東邨|興東,Hing Tung,Hing Tung Estate|東區|public
愛東邨|愛東,Oi Tung,Oi Tung Estate|東區|public
興華邨|興華,興華一邨,興華二邨,Hing Wah,Hing Wah Estate|東區|public
柴灣邨|柴灣,Chai Wan Estate|東區|public
健康村|北角健康村,Healthy Village|東區|public
模範邨|模範,Model Housing,Model Housing Estate|東區|public
西環邨|西環,Sai Wan Estate|中西區|public
觀塘邨|觀塘,Kwun Tong Estate|觀塘|public
秀茂坪邨|秀茂坪,Sau Mau Ping,Sau Mau Ping Estate|觀塘|public
秀茂坪南邨|秀茂坪南,Sau Mau Ping South,Sau Mau Ping (South) Estate|觀塘|public
順天邨|順天,Shun Tin,Shun Tin Estate|觀塘|public
順安邨|順安,Shun On,Shun On Estate|觀塘|public
牛頭角上邨|牛頭角上,Upper Ngau Tau Kok,Upper Ngau Tau Kok Estate|觀塘|public
牛頭角下邨|牛頭角下,Lower Ngau Tau Kok,Lower Ngau Tau Kok Estate|觀塘|public
彩霞邨|彩霞,Choi Ha,Choi Ha Estate|觀塘|public
啟業邨|啟業,Kai Yip,Kai Yip Estate|觀塘|public
坪石邨|坪石,Ping Shek,Ping Shek Estate|觀塘|public
彩虹邨|彩虹,Choi Hung,Choi Hung Estate|黃大仙|public
黃大仙下邨|黃大仙下,黃大仙下（一）邨,黃大仙下邨一區,黃大仙下二邨,黃大仙下（二）邨,黃大仙下(二)邨,Lower Wong Tai Sin,Lower Wong Tai Sin Estate|黃大仙|public
黃大仙上邨|黃大仙上,Upper Wong Tai Sin,Upper Wong Tai Sin Estate|黃大仙|public
竹園北邨|竹園北,Chuk Yuen North,Chuk Yuen (North) Estate|黃大仙|public
竹園南邨|竹園南,Chuk Yuen South,Chuk Yuen South Estate|黃大仙|public
慈雲山邨|慈雲山,Tsz Wan Shan|黃大仙|public
慈樂邨|慈樂,Tsz Lok,Tsz Lok Estate|黃大仙|public
東頭邨|東頭,東頭二邨,東頭(二)邨,東頭（二）邨,Tung Tau,Tung Tau Estate,Tung Tau II Estate|黃大仙|public
美東邨|美東,Mei Tung,Mei Tung Estate|黃大仙|public
東匯邨|東匯,Tung Wui,Tung Wui Estate|黃大仙|public
美東樓|美東樓,Mei Tung House,美東邨美東樓,東頭邨美東樓|黃大仙|public||check
美寶樓|美寶,Mei Po House,美東邨美寶樓|黃大仙|public||check
美仁樓|美仁,Mei Yan House,美東邨美仁樓|黃大仙|public
美德樓|美德,Mei Tak House,美東邨美德樓|黃大仙|public
康東樓|康東,Hong Tung House,東頭邨康東樓|黃大仙|public
裕東樓|裕東,Yu Tung House,東頭邨裕東樓|黃大仙|public
耀東樓|耀東,Yiu Tung House,東頭邨耀東樓|黃大仙|public
富東樓|富東,Fu Tung House,東頭邨富東樓|黃大仙|public
泰東樓|泰東,Tai Tung House,東頭邨泰東樓|黃大仙|public
欣東樓|欣東,Yan Tung House,東頭邨欣東樓|黃大仙|public
逸東樓|逸東樓,Yat Tung House,東頭邨逸東樓|黃大仙|public
盈東樓|盈東,Ying Tung House,東頭邨盈東樓|黃大仙|public
柏東樓|柏東,Pak Tung House,東頭邨柏東樓|黃大仙|public
偉東樓|偉東,Wai Tung House,東頭邨偉東樓|黃大仙|public
榮東樓|榮東,Wing Tung House,東頭邨榮東樓|黃大仙|public
振東樓|振東,Chun Tung House,東頭邨振東樓|黃大仙|public
貴東樓|貴東,Kwai Tung House,東頭邨貴東樓|黃大仙|public
彩東樓|彩東,Choi Tung House,東頭邨彩東樓|黃大仙|public
興東樓|興東樓,Hing Tung House,東頭邨興東樓|黃大仙|public
祥東樓|祥東,Cheung Tung House,東頭邨祥東樓|黃大仙|public
旺東樓|旺東,Wong Tung House,東頭邨旺東樓|黃大仙|public
安東樓|安東,On Tung House,東頭邨安東樓|黃大仙|public
茂東樓|茂東,Mau Tung House,東頭邨茂東樓|黃大仙|public
盛東樓|盛東,Shing Tung House,東頭邨盛東樓|黃大仙|public
東頭村|東頭村,Tung Tau Village,Tung Tau Tsuen,元朗東頭村,十八鄉東頭村|元朗|village|十八鄉
樂富邨|樂富,Lok Fu,Lok Fu Estate|黃大仙|public
宏康樓|Wang Hong House,樂富邨宏康樓|黃大仙|public
宏樂樓|Wang Lok House,樂富邨宏樂樓|黃大仙|public
宏順樓|Wang Shun House,樂富邨宏順樓|黃大仙|public
宏達樓|Wang Tat House,樂富邨宏達樓|黃大仙|public
宏逸樓|Wang Yat House,樂富邨宏逸樓|黃大仙|public
宏旭樓|Wang Yuk House,樂富邨宏旭樓|黃大仙|public
樂東樓|Lok Tung House,樂富邨樂東樓|黃大仙|public
樂民樓|Lok Man House,樂富邨樂民樓|黃大仙|public
樂謙樓|Lok Him House,樂富邨樂謙樓|黃大仙|public
樂翠樓|Lok Tsui House,樂富邨樂翠樓|黃大仙|public
樂泰樓|Lok Tai House,樂富邨樂泰樓|黃大仙|public
彩雲邨|彩雲,彩雲一邨,彩雲二邨,Choi Wan,Choi Wan Estate|黃大仙|public
橫頭磡邨|橫頭磡,Wang Tau Hom,Wang Tau Hom Estate|黃大仙|public
石硤尾邨|石硤尾,Shek Kip Mei,Shek Kip Mei Estate|深水埗|public
白田邨|白田,Pak Tin,Pak Tin Estate|深水埗|public
李鄭屋邨|李鄭屋,Lei Cheng Uk,Lei Cheng Uk Estate|深水埗|public
蘇屋邨|蘇屋,So Uk,So Uk Estate|深水埗|public
長沙灣邨|長沙灣,Cheung Sha Wan Estate|深水埗|public
南山邨|南山,Nam Shan,Nam Shan Estate|深水埗|public
麗閣邨|麗閣,Lai Kok,Lai Kok Estate|深水埗|public
海麗邨|海麗,Hoi Lai,Hoi Lai Estate|深水埗|public
海達邨|海達,Hoi Tat,Hoi Tat Estate|深水埗|public
富昌邨|富昌,Fu Cheong,Fu Cheong Estate|深水埗|public
元州邨|元州,Un Chau,Un Chau Estate|深水埗|public
紅磡邨|紅磡,Hung Hom Estate|九龍城|public
何文田邨|何文田,Ho Man Tin Estate|九龍城|public
愛民邨|愛民,Oi Man,Oi Man Estate|九龍城|public
家維邨|家維,Ka Wai|九龍城|public
馬頭圍邨|馬頭圍,Ma Tau Wai,Ma Tau Wai Estate|九龍城|public
樂民新村|樂民,Lok Man|九龍城|public
彩虹道邨|彩虹道,Choi Hung Road Estate|黃大仙|public
大坑東邨|大坑東,Tai Hang Tung,Tai Hang Tung Estate|深水埗|public
大坑西邨|大坑西,大坑西新邨,Tai Hang Sai|深水埗|public
梨木樹邨|梨木樹,梨木樹一邨,梨木樹二邨,Lei Muk Shue,Lei Muk Shue Estate|荃灣|public
麗瑤邨|麗瑤,Lai Yiu,Lai Yiu Estate|葵青|public
象山邨|象山,Cheung Shan,Cheung Shan Estate|荃灣|public
福來邨|福來,Fuk Loi,Fuk Loi Estate|荃灣|public
葵芳邨|葵芳,Kwai Fong,Kwai Fong Estate|葵青|public
葵盛東邨|葵盛東,Kwai Shing East,Kwai Shing East Estate|葵青|public
葵盛西邨|葵盛西,Kwai Shing West,Kwai Shing West Estate|葵青|public
葵涌邨|葵涌,Kwai Chung Estate|葵青|public
石籬邨|石籬,石籬一邨,石籬二邨,Shek Lei,Shek Lei Estate|葵青|public
石蔭邨|石蔭,Shek Yam,Shek Yam Estate|葵青|public
石蔭東邨|石蔭東,Shek Yam East,Shek Yam East Estate|葵青|public
安蔭邨|安蔭,On Yam,On Yam Estate|葵青|public
長安邨|長安,Cheung On,Cheung On Estate|葵青|public
長康邨|長康,Cheung Hong,Cheung Hong Estate|葵青|public
長青邨|長青,Cheung Ching,Cheung Ching Estate|葵青|public
長亨邨|長亨,Cheung Hang,Cheung Hang Estate|葵青|public
青衣邨|青衣,Tsing Yi Estate|葵青|public
長發邨|長發,Cheung Fat,Cheung Fat Estate|葵青|public
長宏邨|長宏,Cheung Wang,Cheung Wang Estate|葵青|public
安定邨|安定,On Ting,On Ting Estate|屯門|public
友愛邨|友愛,Yau Oi,Yau Oi Estate|屯門|public
山景邨|山景,Shan King,Shan King Estate|屯門|public
大興邨|大興,大興上邨,大興下邨,Tai Hing,Tai Hing Estate|屯門|public
良景邨|良景,Leung King,Leung King Estate|屯門|public
田景邨|田景,Tin King,Tin King Estate|屯門|public
寶田邨|寶田,Po Tin,Po Tin Estate|屯門|public
富泰邨|富泰,Fu Tai,Fu Tai Estate|屯門|public
欣田邨|欣田,Yan Tin,Yan Tin Estate|屯門|public
兆康苑|兆康,Siu Hong Court|屯門|hos
兆翠苑|兆翠,Siu Chui Court,Siu Tsui Court|屯門|hos|||恒富街26號
悅湖山莊|悅湖,Yuet Wu Villa|屯門|hos
天耀邨|天耀,天耀一邨,天耀二邨,Tin Yiu,Tin Yiu Estate|元朗|public|天水圍
天瑞邨|天瑞,天瑞一邨,天瑞二邨,Tin Shui,Tin Shui Estate|元朗|public|天水圍
天慈邨|天慈,Tin Tsz,Tin Tsz Estate|元朗|public|天水圍
天華邨|天華,Tin Wah,Tin Wah Estate|元朗|public|天水圍
天恩邨|天恩,Tin Yan,Tin Yan Estate|元朗|public|天水圍
天恒邨|天恒,Tin Heng,Tin Heng Estate|元朗|public|天水圍
天逸邨|天逸,Tin Yat,Tin Yat Estate|元朗|public|天水圍
天晴邨|天晴,Tin Ching,Tin Ching Estate|元朗|public|天水圍
天澤邨|天澤,Tin Chak,Tin Chak Estate|元朗|public|天水圍
天悅邨|天悅,Tin Yuet,Tin Yuet Estate|元朗|public|天水圍
朗屏邨|朗屏,Long Ping,Long Ping Estate|元朗|public
水邊圍邨|水邊圍,Shui Pin Wai,Shui Pin Wai Estate|元朗|public
天水圍北|天水圍,Tin Shui Wai North|元朗|public|天水圍
天富苑|天富,Tin Fu Court|元朗|hos|天水圍
天盛苑|天盛,Tin Shing Court|元朗|hos|天水圍
天愛苑|天愛,Tin Oi Court|元朗|hos|天水圍
天頌苑|天頌,Tin Chung Court|元朗|hos|天水圍
天麗苑|天麗,Tin Lai Court|元朗|hos|天水圍
天祐苑|天祐,Tin Yau Court|元朗|hos|天水圍
鳳庭苑|鳳庭,Fung Ting Court|元朗|hos
屏欣苑|屏欣,Ping Yan Court|元朗|hos|屏山
宏富苑|宏富,Wang Fu Court|元朗|hos
朗天苑|朗天,Long Tin Court|元朗|hos|屏山||青山公路－屏山段130號
朗松閣|朗松,Long Chung House,朗天苑朗松閣,朗天苑A座|元朗|hos|屏山||青山公路－屏山段130號
朗桃閣|朗桃,Long Tao House,朗天苑朗桃閣,朗天苑B座|元朗|hos|屏山||青山公路－屏山段130號
朗杏閣|朗杏,Long Heng House,朗天苑朗杏閣,朗天苑C座|元朗|hos|屏山||青山公路－屏山段130號
朗風苑|朗風,Long Fung Court|元朗|hos|屏山|覆蓋需查核|朗風街18號
匯熙苑|匯熙,Wui Hei Court|元朗|hos|錦田|覆蓋需查核|錦義路1號
御豪山莊|Park Royale|元朗|private|朗屏||公園北路38號
御景園|Scenic Gardens,公園南路25號御景園,元朗御景園|元朗|private|朗屏||公園南路25號
朗逸豪園|朗逸豪園,Park Villa Ping Shan|元朗|private|屏山
綠悅|綠悅,The Greenery|元朗|private|屏山
天晉|天晉,The Wings|西貢|private|將軍澳
將軍澳中心|將軍澳中心,Park Central|西貢|private|將軍澳
東港城|東港城,East Point City|西貢|private|將軍澳
新都城|新都城,Metro City|西貢|private|將軍澳
慧安園|慧安園,Well On Garden|西貢|private|將軍澳
廣明苑|廣明,廣明苑,Kwong Ming Court|西貢|hos|將軍澳
影輝苑|影輝,Ying Fai Court|西貢|hos|將軍澳|覆蓋需查核|影業路16號
英明苑|英明,Ying Ming Court|西貢|hos|將軍澳
唐明苑|唐明,Tong Ming Court|西貢|hos|將軍澳
尚德邨|尚德,Sheung Tak,Sheung Tak Estate|西貢|public|將軍澳
怡明邨|怡明,Yi Ming,Yee Ming Estate|西貢|public|將軍澳
日出康城|康城,LOHAS Park,Lohas Park|西貢|private|將軍澳
維景灣畔|維景灣畔,Ocean Shores|西貢|private|將軍澳
厚德邨|厚德,Hau Tak,Hau Tak Estate|西貢|public|將軍澳
明德邨|明德,Ming Tak,Ming Tak Estate|西貢|public|將軍澳
景林邨|景林,King Lam,King Lam Estate|西貢|public|將軍澳
寶林邨|寶林,Po Lam,Po Lam Estate|西貢|public|將軍澳
翠林邨|翠林,Tsui Lam,Tsui Lam Estate|西貢|public|將軍澳
坑口邨|坑口,Hang Hau|西貢|public|將軍澳
健明邨|健明,Kin Ming,Kin Ming Estate|西貢|public|將軍澳
善明邨|善明,Shin Ming,Shin Ming Estate|西貢|public|將軍澳
彩明邨|彩明邨,Choi Ming Estate|西貢|public|將軍澳
彩明苑|彩明,Choi Ming Court|西貢|hos|將軍澳
彩楊閣|彩楊,Choi Yeung House,彩明苑彩楊閣|西貢|hos|將軍澳
彩柳閣|彩柳,Choi Lau House,彩明苑彩柳閣|西貢|hos|將軍澳
彩松閣|彩松,Choi Chung House,彩明苑彩松閣|西貢|hos|將軍澳
彩柏閣|彩柏,Choi Pak House,彩明苑彩柏閣|西貢|hos|將軍澳
彩桃閣|彩桃,Choi Tao House,彩明苑彩桃閣|西貢|hos|將軍澳
彩梅閣|彩梅,Choi Mui House,彩明苑彩梅閣|西貢|hos|將軍澳
沙田第一城|第一城,City One|沙田|private
沙田中心|沙田中心,Shatin Centre|沙田|private
沙田圍|沙田圍,Sha Tin Wai|沙田|public
瀝源邨|瀝源,Lek Yuen,Lek Yuen Estate|沙田|public
禾輋邨|禾輋,Wo Che,Wo Che Estate|沙田|public
廣源邨|廣源,Kwong Yuen,Kwong Yuen Estate|沙田|public
水泉澳邨|水泉澳,Shui Chuen O,Shui Chuen O Estate|沙田|public
廣林苑|廣林,Kwong Lam Court|沙田|hos
穗禾苑|穗禾,Sui Wo Court|沙田|hos
豐盛苑|豐盛,Fung Shing Court|沙田|hos
名城|名城,Festival City|沙田|private|大圍
麗城花園|麗城,Belair Gardens|沙田|private
御龍山|御龍山,The Palazzo ST|沙田|private
銀禧花園|銀禧,Jubilee Garden|沙田|private
駿景園|駿景,Royal Ascot|沙田|private
顯徑邨|顯徑,Hin Keng,Hin Keng Estate|沙田|public
秦石邨|秦石,Chun Shek,Chun Shek Estate|沙田|public
新田圍邨|新田圍,Sun Tin Wai,Sun Tin Wai Estate|沙田|public
美林邨|美林,Mei Lam,Mei Lam Estate|沙田|public
美田邨|美田,Mei Tin,Mei Tin Estate|沙田|public
圓洲角|圓洲角,Yuen Chau Kok|沙田|public
馬鞍山中心|馬鞍山中心,Ma On Shan Centre|沙田|private|馬鞍山
新港城|新港城,Sunshine City|沙田|private|馬鞍山
聽濤雅苑|Vista Paradiso|沙田|private|馬鞍山||恆明街2號
迎海|迎海,Double Cove|沙田|private|馬鞍山
錦豐苑|錦豐,Kam Fung Court|沙田|hos|馬鞍山
耀安邨|耀安,Yiu On,Yiu On Estate|沙田|public|馬鞍山
恆安邨|恆安,Heng On,Heng On Estate|沙田|public|馬鞍山
錦英苑|錦英,Kam Ying Court|沙田|hos|馬鞍山
富安花園|富安,Chevalier Garden|沙田|hos|馬鞍山
大埔中心|大埔中心,Tai Po Centre|大埔|private
太和邨|太和,Tai Wo,Tai Wo Estate|大埔|public
富亨邨|富亨,Fu Heng,Fu Heng Estate|大埔|public
富善邨|富善,Fu Shin,Fu Shin Estate|大埔|public
廣福邨|廣福,Kwong Fuk,Kwong Fuk Estate|大埔|public
大元邨|大元,Tai Yuen,Tai Yuen Estate|大埔|public
運頭塘邨|運頭塘,Wan Tau Tong,Wan Tau Tong Estate|大埔|public
寶湖花園|寶湖,Treasure Garden|大埔|private
帝欣苑|帝欣,Parc Versailles|大埔|private|||梅樹坑路8號
粉嶺中心|粉嶺中心,Fanling Centre|北區|private
華明邨|華明,Wah Ming,Wah Ming Estate|北區|public
祥華邨|祥華,Cheung Wah,Cheung Wah Estate|北區|public
嘉福邨|嘉福,Ka Fuk,Ka Fuk Estate|北區|public
清河邨|清河,Ching Ho,Ching Ho Estate|北區|public
天平邨|天平,Tin Ping,Tin Ping Estate|北區|public
彩園邨|彩園,Choi Yuen,Choi Yuen Estate|北區|public
上水匯|上水匯,Sheung Shui Town Centre|北區|private
太古城|太古城,Taikoo Shing|東區|private
康怡花園|康怡,Kornhill|東區|private
杏花邨|杏花邨,Heng Fa Chuen|東區|private
嘉亨灣|嘉亨灣,Grand Promenade|東區|private
南豐新邨|南豐新邨,Nam Fung Sun Chuen|東區|private
北角匯|北角匯,Harbour North|東區|private
城市花園|城市花園,City Garden|東區|private
和富中心|和富,Provident Centre|東區|private
薄扶林花園|薄扶林,Pokfulam Gardens|南區|private
置富花園|置富,Chi Fu Fa Yuen|南區|private
貝沙灣|貝沙灣,Residence Bel-Air|南區|private
深灣軒|深灣軒,Sham Wan Towers|南區|private
海怡半島|海怡,South Horizons|南區|private
黃埔花園|黃埔,Whampoa Garden|九龍城|private
海逸豪園|海逸豪園,Laguna Verde|九龍城|private
翔龍灣|翔龍灣,Grand Waterfront|九龍城|private|土瓜灣
奧海城|奧海城,Olympian City|油尖旺|private
君匯港|君匯港,Harbour Green|油尖旺|private
浪澄灣|浪澄灣,The Long Beach|油尖旺|private
維港灣|維港灣,Island Harbourview|油尖旺|private
旺角中心|旺角中心,Argyle Centre|油尖旺|private
美孚新邨|美孚,Mei Foo Sun Chuen|深水埗|private
碧海藍天|碧海藍天,Aqua Marine|深水埗|private
宇晴軒|宇晴軒,The Pacifica|深水埗|private
昇悅居|昇悅居,Banyan Garden|深水埗|private
又一村|又一村,Yau Yat Tsuen|深水埗|private
麗港城|麗港城,Laguna City|觀塘|private
匯景花園|匯景,Sceneway Garden|觀塘|private
德福花園|德福,Telford Gardens|觀塘|private
淘大花園|淘大,Amoy Gardens|觀塘|private
麗晶花園|麗晶,Richland Gardens|觀塘|private
宏緻苑|宏緻,Wang Chi Court|觀塘|hos|九龍灣
富緻閣|富緻,Fu Chi House,宏緻苑富緻閣|觀塘|hos|九龍灣
喜緻閣|喜緻,Hei Chi House,宏緻苑喜緻閣|觀塘|hos|九龍灣
崇緻閣|崇緻,Sung Chi House,宏緻苑崇緻閣|觀塘|hos|九龍灣
盛緻苑|盛緻,Shing Chi Court|觀塘|hos|九龍灣||宏照道3號
景泰苑|景泰,King Tai Court|黃大仙|hos
啟德1號|ONE KAI TAK,One Kai Tak,啟德一號|九龍城|private|啟德
啟悅苑|啟悅,Kai Yuet Court|九龍城|hos|啟德||沐和街2號
啟欣苑|啟欣,Kai Yan Court|九龍城|hos|啟德||沐禮街6號
啟盈苑|啟盈,Kai Ying Court|九龍城|hos|啟德
啟陽苑|啟陽,Kai Yeung Court|九龍城|hos|啟德|覆蓋需查核|沐和街8號
天水圍嘉湖山莊|嘉湖,嘉湖山莊,Kingswood Villas|元朗|private|天水圍
俊宏軒|俊宏,Grandeur Terrace,Grandeur Terrace Estate,天水圍俊宏軒,天瑞路88號俊宏軒|元朗|public|天水圍||天瑞路88號
慧景軒|慧景,Vianni Cove,天水圍慧景軒,天葵路33號慧景軒|元朗|private|天水圍||天葵路33號
YOHO Town|YOHO,Yoho Town,元朗YOHO|元朗|private
YOHO Midtown|YOHO Midtown|元朗|private
加州花園|加州花園,Palm Springs|元朗|private
加州豪園|加州豪園,Royal Palms|元朗|private
錦繡花園|錦繡花園,Fairview Park|元朗|private
爾巒|爾巒,The Reach|元朗|private
峻巒|峻巒,Park Yoho|元朗|private
瓏門|瓏門,Century Gateway|屯門|private
愛琴灣|愛琴灣,Aegean Coast|屯門|private
掃管笏|掃管笏,So Kwun Wat|屯門|private
黃金海岸|黃金海岸,Gold Coast|屯門|private
荃灣中心|荃灣中心,Tsuen Wan Centre|荃灣|private
綠楊新邨|綠楊,Luk Yeung Sun Chuen|荃灣|private
灣景花園|灣景花園,Belvedere Garden|荃灣|private
海濱花園|海濱花園,Riviera Gardens|荃灣|private
祈德尊新邨|祈德尊,Clague Garden Estate|荃灣|public
海之戀|海之戀,The Pavilia Bay|荃灣|private
柏傲灣|柏傲灣,The Pavilia|荃灣|private
環宇海灣|環宇海灣,Ocean Pride|荃灣|private
大窩口邨|大窩口,Tai Wo Hau,Tai Wo Hau Estate|葵青|public
葵翠邨|葵翠,Kwai Tsui,Kwai Tsui Estate|葵青|public
葵聯邨|葵聯,Kwai Luen,Kwai Luen Estate|葵青|public
長亨|長亨邨,Cheung Hang|葵青|public
青衣城|青衣城,Maritime Square|葵青|private
灝景灣|灝景灣,Villa Esplanada|葵青|private
藍澄灣|藍澄灣,Rambler Crest|葵青|private
盈翠半島|盈翠,Tierra Verde|葵青|private
東涌逸東邨|逸東,逸東邨,逸東一邨,逸東二邨,Yat Tung,Yat Tung Estate|離島|public|東涌
滿東邨|滿東,Mun Tung,Mun Tung Estate|離島|public|東涌
迎東邨|迎東,Ying Tung,Ying Tung Estate|離島|public|東涌
裕東苑|裕東,Yu Tung Court|離島|hos|東涌
裕雅苑|裕雅,Yu Nga Court|離島|hos|東涌
裕豐苑|裕豐,Yu Fung Court|離島|hos|東涌|覆蓋需查核|匯東街12號
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
廈村|廈村,厦村,Ha Tsuen|元朗|village
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
西貢海傍街|Hoi Pong Street,西貢市,海傍街,Sai Kung Town,Sai Kung Hoi Pong Street|西貢|village
西貢匡湖居|匡湖居,Marina Cove|西貢|private
西貢澳南|澳南,Ao Nan|西貢|village
清水灣|清水灣,Clear Water Bay|西貢|private
坑口村|Hang Hau Village,坑口舊村|西貢|village
南圍|南圍,Nam Wai|西貢|village
蠔涌|蠔涌,Ho Chung|西貢|village
大網仔|大網仔,Tai Mong Tsai|西貢|village
馬鞍山烏溪沙|烏溪沙,Wu Kai Sha|沙田|private
西沙路|西沙,Sai Sha|沙田|village
沙田火炭|火炭,Fo Tan|沙田|private
大圍美田|大圍,Tai Wai|沙田|private
寶達邨|寶達邨,Po Tat Estate|觀塘|public
順利邨|順利,Shun Lee,Shun Lee Estate|觀塘|public
順緻苑|順緻,Shun Chi Court|觀塘|hos
彩德邨|彩德,Choi Tak,Choi Tak Estate|觀塘|public
彩福邨|彩福,Choi Fook,Choi Fook Estate|觀塘|public
啟田邨|啟田,Kai Tin,Kai Tin Estate|觀塘|public
藍田邨|藍田,Lam Tin Estate|觀塘|public
廣田邨|廣田,Kwong Tin,Kwong Tin Estate|觀塘|public
德田邨|德田,Tak Tin,Tak Tin Estate|觀塘|public
平田邨|平田,Ping Tin,Ping Tin Estate|觀塘|public
油塘邨|油塘,Yau Tong Estate|觀塘|public
油麗邨|油麗,Yau Lai,Yau Lai Estate|觀塘|public
高翔苑|高翔,Ko Cheung Court,油塘高翔苑|觀塘|hos|油塘||高超道32號
康華苑|康華,Hong Wah Court|觀塘|hos
鯉魚門邨|鯉魚門,Lei Yue Mun Estate|觀塘|public
鯉安苑|居屋鯉安苑,Lei On Court|觀塘|hos
安達邨|安達,On Tat,On Tat Estate|觀塘|public
安泰邨|安泰,On Tai,On Tai Estate|觀塘|public
安楹苑|安楹,On Ying Court|觀塘|hos
安樺苑|安樺,On Wah Court|觀塘|hos
安麗苑|安麗,On Lai Court|觀塘|hos
康山花園|康山,Kornhill Gardens,Kornhill|東區|hos
天水圍天華|天華,Tin Wah|元朗|public|天水圍
馬灣|馬灣,Ma Wan|荃灣|village|馬灣
井欄樹村|井欄樹,Tseng Lan Shue|西貢|village
木棉下村|木棉下,Muk Min Ha|荃灣|village
荃灣新村|Tsuen Wan San Tsuen|荃灣|village
白田壩村|白田壩,Pak Tin Pa|荃灣|village
馬閃排|馬閃排,Ma Sim Pai|荃灣|village
海壩東北台|海壩東北,海壩(東北台),Hoi Pa,Hoi Pa Village Northeast Terrace,荃灣海壩東北台|荃灣|village
西樓角|西樓角,Sai Lau Kok|荃灣|village
海壩南台|海壩南台,海壩(南台),Hoi Pa Village South Terrace,荃灣海壩南台,荃灣海壩村,荃灣海壩|荃灣|village
下洋新村|下洋新村,Ha Yeung San Tsuen|西貢|village
大坳門|大坳門,Tai Au Mun|西貢|village
`.trim();

export const ESTATES: Estate[] = `${RAW}\n${EXTRA_RAW}\n${PRH_BLOCKS_RAW}\n${VILLAGE_RAW}`
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .flatMap((line): Estate[] => {
    const [name, aliasStr, district, housing, area, flag, street] = line.split("|");
    if (!name || !district || !housing || !isKnownHousing(housing)) return [];
    return [
      {
        name,
        aliases: (aliasStr ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        district,
        housing,
        area: area || undefined,
        coverageCheck: flag === "check" || flag === "覆蓋需查核" || undefined,
        street: street?.trim() || undefined,
      },
    ];
  })
  .filter((item, index, list) => list.findIndex((x) => x.name === item.name) === index);

export function compact(value: string) {
  return toTraditional(value)
    .replace(/滙/g, "匯")
    .replace(/[\s\-'’_.．]/g, "")
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 48))
    .replace(/[Ａ-Ｚａ-ｚ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .toLowerCase();
}

const NON_ESTATE_RAW = `
鰂魚涌|Quarry Bay
炮台山|Fortress Hill
寶馬山|Braemar Hill
半山區|半山,Mid-Levels
西半山|Western Mid-Levels
堅尼地城|Kennedy Town
西營盤|Sai Ying Pun
大角咀|Tai Kok Tsui
九龍塘|Kowloon Tong
廣播道|Broadcast Drive
何文田山道|何文田山
啟德|啟德新區,Kai Tak
濕地公園路|濕地公園
新城市廣場|New Town Plaza
形點|Yoho Mall
海麗商場|Hoi Lai Shopping Centre,海麗商場長沙灣
荃灣廣場|Tsuen Wan Plaza
新時代廣場|屯門市廣場,Tuen Mun Town Plaza
`.trim();

const NON_ESTATE_NEEDLES = NON_ESTATE_RAW.split("\n").flatMap((line) => {
  const [name, aliasStr] = line.split("|");
  return [name, ...(aliasStr ?? "").split(",")]
    .map((s) => compact(s))
    .filter((s) => s.length >= 2);
});

const PLACE_ENGLISH = new Map<string, string>();
for (const line of NON_ESTATE_RAW.split("\n")) {
  const [name, aliasStr] = line.split("|");
  if (!name) continue;
  const english = (aliasStr ?? "")
    .split(",")
    .map((item) => item.trim())
    .find((alias) => looksEnglish(alias));
  if (english) PLACE_ENGLISH.set(name, english);
}

/** English for a district / area / place only when a known map or catalogue alias exists. */
export function placeEnglishName(place: string): string | undefined {
  const named = ESTATES.find((estate) => estate.name === place);
  if (named) return estateEnglishName(named);
  return PLACE_ENGLISH.get(place) ?? districtEnglishName(place);
}

export function placeDisplayName(place: string, locale: Locale = "zh") {
  if (locale === "en") return placeEnglishName(place) || place;
  return place;
}

export function isNonEstatePlace(query: string): boolean {
  const q = compact(query);
  if (!q) return false;
  return NON_ESTATE_NEEDLES.some((needle) => q === needle || q.startsWith(needle));
}

/** Housing-type words, not an estate — 「村屋／丁屋／village house」. */
export function isBareHousingTypeQuery(query: string): boolean {
  const q = compact(query);
  return q === "村屋" || q === "丁屋" || q === "villagehouse" || q === "villagehouses";
}

function estateNeedles(estate: Estate): string[] {
  const extra = estate.street ? [estate.street] : [];
  return [...new Set([estate.name, ...estate.aliases, ...extra].map(compact).filter((n) => n.length >= 2))];
}

/**
 * Area aliases must not match as a prefix of a road/street (長沙灣 ⊂ 長沙灣道).
 * Full 邨／苑／村／樓／閣 names may still sit in a street named after them (東頭村道).
 */
const ROAD_HEAD =
  /^(?:道|路|街|里|巷|坊|徑|公路|大道|大街|road|street|lane|path|drive|avenue|rd(?![a-z])|st(?![a-z])|ave(?![a-z])|dr(?![a-z])|ln(?![a-z]))/;
const COMPLETE_PLACE_TAIL = /[邨苑村樓閣]$/;
const NEEDLE_IS_ROAD = /(?:道|路|街|里|巷|坊|徑)$/;

function needleEmbeddedInRoad(needle: string, after: string): boolean {
  if (!ROAD_HEAD.test(after)) return false;
  if (COMPLETE_PLACE_TAIL.test(needle) || NEEDLE_IS_ROAD.test(needle)) return false;
  return true;
}

function textHasEstateNeedle(text: string, needle: string): boolean {
  if (!needle || needle.length < 2 || !text) return false;
  let from = 0;
  while (from <= text.length - needle.length) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) return false;
    const after = text.slice(idx + needle.length);
    if (!needleEmbeddedInRoad(needle, after)) return true;
    from = idx + 1;
  }
  return false;
}

/** Estate / 苑 parents only — never village (村) or short aliases like「東頭」. */
export function isCatalogueParent(estate: Estate): boolean {
  return estate.housing !== "village" && /[邨苑]$/.test(estate.name);
}

/**
 * Link 樓／閣 rows to a parent using the parent's full catalogue name only.
 * 「東頭邨康東樓」→ 東頭邨; 「東頭」must not attach 東頭村 to 東頭邨 blocks.
 * 樂富邨 blocks (宏康樓…樂泰樓) come from HA PRH stock `ha_prhs_h` (Wong Tai Sin),
 * not guessed names — keep the 「邨名××樓」alias so relatedBlocks can attach them.
 * Bulk PRH 樓／閣 rows live in estate-prh-blocks-raw.ts (scripts/sync-prh-blocks.mjs).
 */
export function isRelatedBlock(child: Estate, parent: Estate): boolean {
  if (child.name === parent.name || parent.housing === "village") return false;
  if (!/[邨苑]$/.test(parent.name)) return false;
  const parentKey = compact(parent.name);
  if (parentKey.length < 3) return false;
  return [child.name, ...child.aliases].some((raw) => {
    const needle = compact(raw);
    if (!needle.startsWith(parentKey) || needle === parentKey) return false;
    const rest = needle.slice(parentKey.length);
    return rest.length >= 2 && /樓|閣|house/.test(rest);
  });
}

const RELATED_BLOCKS = new Map<string, Estate[]>();
const PARENT_OF_BLOCK = new Map<string, Estate>();
for (const parent of ESTATES) {
  if (!isCatalogueParent(parent)) continue;
  const children = ESTATES.filter((child) => isRelatedBlock(child, parent));
  if (children.length) RELATED_BLOCKS.set(parent.name, children);
  for (const child of children) {
    if (!PARENT_OF_BLOCK.has(child.name)) PARENT_OF_BLOCK.set(child.name, parent);
  }
}

export function relatedBlocks(parent: Estate | string): Estate[] {
  const name = typeof parent === "string" ? parent : parent.name;
  return RELATED_BLOCKS.get(name) ?? [];
}

/** Parent 邨／苑 for a 樓／閣 row. Undefined when the row is itself a catalogue parent. */
export function parentEstate(child: Estate | string): Estate | undefined {
  const name = typeof child === "string" ? child : child.name;
  return PARENT_OF_BLOCK.get(name);
}

const ALL_ESTATE_NEEDLES = [...new Set(ESTATES.flatMap(estateNeedles))].sort(
  (a, b) => b.length - a.length,
);

function longestHit(candidates: string[], query: string): string | undefined {
  return candidates.filter((item) => item.includes(query) || item.startsWith(query)).sort((a, b) => b.length - a.length)[0];
}

/** Block / phase / English estate tails. Never strip 邨／村／苑. */
const BLOCK_TAIL =
  /(?:第?(?:\d+|[a-z])[座期室號棟樓層]|[a-z]\d*座|(?:phase|block|tower|estate|court|houses?|gardens?|villas?)\d*)$/;

/** Rd/St/Ave tails only — never strip Road back to an area alias (長沙灣道 class). */
const STREET_ABBREV_TAILS = [
  ["rd", "road"],
  ["st", "street"],
  ["ave", "avenue"],
  ["dr", "drive"],
  ["ln", "lane"],
] as const;

function expandStreetAbbrevs(q: string): string[] {
  if (!q) return [];
  const extra: string[] = [];
  for (const [short, full] of STREET_ABBREV_TAILS) {
    if (q.length > short.length + 2 && q.endsWith(short) && !q.endsWith(full)) {
      extra.push(`${q.slice(0, -short.length)}${full}`);
    }
  }
  return extra;
}

function searchKeys(query: string): string[] {
  const q = compact(query);
  if (!q) return [];
  const keys = [q, ...expandStreetAbbrevs(q)];
  let stripped = q.replace(/[，,、.。/\\]/g, "");
  if (stripped.length >= 2 && stripped !== q) keys.push(stripped);
  let prev = "";
  while (stripped.length >= 2 && stripped !== prev) {
    prev = stripped;
    const next = stripped.replace(BLOCK_TAIL, "");
    if (next === stripped || next.length < 2) break;
    stripped = next;
    keys.push(stripped);
  }
  if (/[道路街]$/.test(stripped) && stripped.length >= 4) {
    const roadless = stripped.replace(/[道路街]$/, "");
    /** Keep 東頭村道 → 東頭村; do not turn 長沙灣道 into alias 長沙灣. */
    if (roadless.length >= 2 && COMPLETE_PLACE_TAIL.test(roadless)) keys.push(roadless);
  }
  return [...new Set(keys)];
}

function canContainAlias(alias: string) {
  return alias.length >= 4 || (alias.length >= 3 && /[邨苑村樓閣園莊城灣庭居]$/.test(alias));
}

/** YOHO Town / Midtown / West / Grand YOHO — not Hub / Mall / 芊御 marketing tags. */
function isYohoSeriesName(nameCompact: string): boolean {
  if (nameCompact === "grandyoho" || nameCompact.startsWith("grandyoho")) return true;
  if (!nameCompact.startsWith("yoho")) return false;
  const rest = nameCompact.slice(4);
  return rest === "" || /^(town|midtown|west|parkside)/.test(rest);
}

/**
 * Bare `yoho` must not match Hub-only / The YOHO 芊御 aliases.
 * Full 「YOHO Hub」 / 「朗城匯」 queries still score via exact alias / name.
 */
export function allowSuggestHitForQuery(query: string, name: string, nameEN = ""): boolean {
  const q = compact(query);
  if (q !== "yoho") return true;
  return isYohoSeriesName(compact(name)) || isYohoSeriesName(compact(nameEN));
}

/** Short English stems must not mid-string match (yoho ⊂ theyoho芊御). */
function allowLooseAliasInclude(alias: string, q: string): boolean {
  if (!/^[a-z0-9]+$/.test(q) || q.length > 4) return true;
  return alias.startsWith(q);
}

function cjkHead(value: string): string {
  const match = value.match(/^[\u4e00-\u9fff]{2,}/);
  return match?.[0] ?? "";
}

const HOT_ESTATE_NAMES = new Set([
  "太古城",
  "天耀邨",
  "天水圍嘉湖山莊",
  "沙田第一城",
  "YOHO Town",
  "YOHO Midtown",
  "YOHO West",
  "Grand YOHO",
  "黃埔花園",
  "美孚新邨",
]);

function hotEstateBoost(estate: Estate, q: string): number {
  if (!q || !HOT_ESTATE_NAMES.has(estate.name)) return 0;
  const name = compact(estate.name);
  if (name.startsWith(q) || name.includes(q)) return 120;
  if (estate.aliases.some((alias) => {
    const key = compact(alias);
    return key === q || key.startsWith(q);
  })) {
    return 120;
  }
  return 0;
}

function scoreAgainstQuery(estate: Estate, q: string): number {
  if (!q) return 0;
  const name = compact(estate.name);
  if (q === "yoho" && !isYohoSeriesName(name)) return 0;
  const aliases = estate.aliases.map(compact);
  const extras = [estate.area ?? "", estate.district].map(compact);
  const street = compact(estate.street ?? "");
  if (name === q) return 1000 + name.length;
  if (aliases.includes(q)) return 900 + q.length;
  if (street && street.length >= 8 && street === q) return 950 + street.length;
  if (street && street.length >= 8 && q.includes(street) && /號/.test(q)) return 880;
  if (name.startsWith(q)) return 700 + name.length;
  const aliasPrefix = aliases.filter((alias) => alias.startsWith(q));
  if (aliasPrefix.length) return 600 + Math.max(...aliasPrefix.map((alias) => alias.length));
  if (q.startsWith(name) && name.length >= 3) return 820 + name.length;
  const aliasHead = aliases.filter((alias) => {
    if (!q.startsWith(alias) || !canContainAlias(alias)) return false;
    return !needleEmbeddedInRoad(alias, q.slice(alias.length));
  });
  if (aliasHead.length) return 780 + Math.max(...aliasHead.map((alias) => alias.length));
  const qCjk = cjkHead(q);
  if (qCjk.length >= 2 && name.startsWith(qCjk)) return 680 + name.length;
  if (name.includes(q)) return 400 + name.length;
  const aliasIncl = aliases.filter((alias) => alias.includes(q) && allowLooseAliasInclude(alias, q));
  if (aliasIncl.length) return 300 + (longestHit(aliasIncl, q)?.length ?? 0);
  if (extras.some((extra) => extra === q)) return 150;
  if (extras.some((extra) => extra.startsWith(q) || extra.includes(q))) return 100;
  return 0;
}

function scoreEstate(estate: Estate, keys: string[]): number {
  let best = 0;
  for (const q of keys) {
    const s = scoreAgainstQuery(estate, q);
    if (s > best) best = s;
  }
  return best;
}

function rankEstates(query: string): { estate: Estate; score: number }[] {
  const keys = searchKeys(query);
  if (!keys.length) return [];
  return ESTATES.map((estate) => ({ estate, score: scoreEstate(estate, keys) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.estate.name.localeCompare(b.estate.name, "zh-Hant"));
}

function uniqueRankedEstate(query: string): Estate | undefined {
  const ranked = rankEstates(query);
  const top = ranked[0];
  if (!top || top.score < 600) return undefined;
  const ambiguous = ranked.some(
    (row) =>
      row.estate.name !== top.estate.name &&
      row.score >= top.score - 80 &&
      !isRelatedBlock(row.estate, top.estate) &&
      !isRelatedBlock(top.estate, row.estate),
  );
  if (ambiguous) return undefined;
  return top.estate;
}

export function searchEstates(query: string, limit = 8): Estate[] {
  if (isBareHousingTypeQuery(query)) return [];
  const q = compact(query);
  const ranked = rankEstates(query)
    .map((row) => ({ estate: row.estate, score: row.score + hotEstateBoost(row.estate, q) }))
    .sort((a, b) => b.score - a.score || a.estate.name.localeCompare(b.estate.name, "zh-Hant"))
    .map((row) => row.estate);
  const out: Estate[] = [];
  const seen = new Set<string>();

  function push(estate: Estate) {
    if (seen.has(estate.name) || out.length >= limit) return;
    seen.add(estate.name);
    out.push(estate);
  }

  for (const estate of ranked) {
    if (out.length >= limit) break;
    push(estate);
    if (!isCatalogueParent(estate)) continue;
    for (const child of relatedBlocks(estate)) {
      if (out.length >= limit) break;
      push(child);
    }
  }
  return out;
}

const ESTATE_BY_COMPACT_NAME = new Map<string, Estate>();
for (const estate of ESTATES) {
  const key = compact(estate.name);
  if (key && !ESTATE_BY_COMPACT_NAME.has(key)) ESTATE_BY_COMPACT_NAME.set(key, estate);
}

let knownEstateCacheKey = "";
let knownEstateCacheValue: Estate | undefined;

export function matchKnownEstate(name: string, address = ""): Estate | undefined {
  const cacheKey = `${name}\0${address}`;
  if (cacheKey === knownEstateCacheKey) return knownEstateCacheValue;
  const found = resolveKnownEstate(name, address);
  knownEstateCacheKey = cacheKey;
  knownEstateCacheValue = found;
  return found;
}

function resolveKnownEstate(name: string, address = ""): Estate | undefined {
  if (isBareHousingTypeQuery(name) && !compact(address)) return undefined;
  const nameCompact = compact(name);
  const hay = compact(`${name}${address}`);
  if (!hay) return undefined;
  if (!compact(address)) {
    const exact = ESTATE_BY_COMPACT_NAME.get(nameCompact);
    if (exact) return exact;
  }

  const present = [...ALL_ESTATE_NEEDLES, ...NON_ESTATE_NEEDLES].filter(
    (needle) => textHasEstateNeedle(hay, needle) || textHasEstateNeedle(nameCompact, needle),
  );

  let best: { estate: Estate; score: number } | undefined;
  if (present.length) {
    for (const estate of ESTATES) {
      const needles = estateNeedles(estate);
      for (const needle of needles) {
        const inName = textHasEstateNeedle(nameCompact, needle);
        if (!inName && !textHasEstateNeedle(hay, needle)) continue;
        /** Village / area names in the street (屏山段) must not steal 朗天苑. */
        if (!inName && !allowAddressOnlyNeedle(estate)) continue;
        const coveredByOther = present.some((longer) => {
          if (longer.length <= needle.length || !longer.includes(needle)) return false;
          return !needles.includes(longer);
        });
        if (coveredByOther) continue;
        let score = needle.length * 10;
        if (compact(estate.name) === nameCompact) score += 50;
        if (needle === nameCompact) score += 30;
        if (inName) score += 8;
        if (!best || score > best.score) best = { estate, score };
      }
    }
  }
  if (best) return best.estate;
  if (isNonEstatePlace(name) || isNonEstatePlace(hay)) return undefined;
  return uniqueRankedEstate(name);
}

/** Address-only hits: keep 邨／苑／私樓 parents, never village area names. */
function allowAddressOnlyNeedle(estate: Estate): boolean {
  if (estate.housing === "village") return false;
  if (/[邨苑]$/.test(estate.name)) return true;
  return estate.housing === "private";
}

export function estateStreet(estate: Estate) {
  return estate.street?.trim() || "";
}

function looksEnglish(value: string) {
  return /[A-Za-z]/.test(value) && value.replace(/[^A-Za-z]/g, "").length >= 3;
}

/** First catalogue alias that looks like an English name. Used for stable slugs. */
export function firstEnglishAlias(estate: Estate): string | undefined {
  return estate.aliases.find((alias) => looksEnglish(alias));
}

/** Display English: prefer official HA Estate / Court names when catalogued. */
export function estateEnglishName(estate: Estate): string | undefined {
  const english = estate.aliases.filter((alias) => looksEnglish(alias));
  if (!english.length) return undefined;
  const official = english.find((alias) => /\b(Estate|Court)\b/.test(alias));
  return official ?? english[0];
}

export function estateDisplayName(estate: Estate, locale: Locale = "zh") {
  if (locale === "en") return estateEnglishName(estate) || estate.name;
  return estate.name;
}

const HOUSING_MESSAGE: Record<Housing, MessageKey> = {
  public: "housingPublic",
  hos: "housingHos",
  private: "housingPrivate",
  village: "housingVillage",
};

export function estateLabel(estate: Estate, locale: Locale = "zh") {
  const place = placeDisplayName(estate.area ?? estate.district, locale);
  const type = locale === "en" ? MESSAGES.en[HOUSING_MESSAGE[estate.housing]] : MESSAGES.zh[HOUSING_MESSAGE[estate.housing]];
  const check = estate.coverageCheck ? " · 覆蓋需查核" : "";
  return `${place} · ${type}${check}`;
}

export type HousingGuess = {
  housing?: Housing;
  confidence: "high" | "medium" | "none";
};

function looksLikeNonVillageEstate(title: string): boolean {
  return (
    /[邨苑]$/.test(title) ||
    /新邨|花園|廣場|中心|大廈|洋房|半島|豪庭|豪園|山莊|屋苑/.test(title) ||
    /(軒|居|閣|樓)$/.test(title)
  );
}

const VILLAGE_NEEDLES = ESTATES.filter((estate) => estate.housing === "village").flatMap(estateNeedles);

export function guessHousing(name: string, address = ""): Housing | undefined {
  const known = matchKnownEstate(name, address);
  if (known) return known.housing;
  if (isNonEstatePlace(name) || isNonEstatePlace(`${name}${address}`)) return undefined;
  const text = `${name}${address}`;
  if (/公屋|屋邨/.test(text)) return "public";
  if (/居屋/.test(text)) return "hos";
  if (/村屋|丁屋|village\s*houses?/i.test(text)) return "village";
  if (/新邨|花園|廣場|中心|大廈|洋房|半島|豪庭|豪園|山莊|屋苑/.test(text)) return "private";
  const title = name.replace(/[，,].*$/, "").trim();
  if (/苑$/.test(title)) return "hos";
  if (/峰$/.test(title)) return "private";
  if (/(軒|居)$/.test(title)) return "private";
  if (/(新村|村|圍)$/.test(title) && !/邨/.test(title)) return "village";
  if (!looksLikeNonVillageEstate(title)) {
    const addr = compact(address);
    if (addr && VILLAGE_NEEDLES.some((needle) => needle.length >= 2 && addr.includes(needle))) {
      return "village";
    }
  }
  return undefined;
}

export function classifyAddress(query: string): HousingGuess {
  const q = query.trim();
  if (q.length < 2) return { confidence: "none" };
  if (isImpracticalPlace(q)) return { confidence: "none" };
  const known = matchKnownEstate(q, "");
  if (known) return { housing: known.housing, confidence: "high" };
  if (isNonEstatePlace(q)) return { confidence: "none" };
  const guessed = guessHousing(q, "");
  if (guessed) return { housing: guessed, confidence: "medium" };
  return { confidence: "none" };
}

export function exactVillageMatch(query: string): Estate | undefined {
  const q = compact(query);
  if (!q) return undefined;
  return ESTATES.find((estate) => estate.housing === "village" && compact(estate.name) === q);
}

/** Exact village queries must not pull 邨／苑 catalogue rows in from gov search. */
export function allowGovHitForQuery(query: string, name: string, address = ""): boolean {
  const village = exactVillageMatch(query);
  if (!village) return true;
  const known = matchKnownEstate(name, address);
  if (!known) return true;
  return known.housing === "village";
}

/** Longest first so「垃圾收集站」wins over「垃圾」-like fragments. */
const FACILITY_NOISE = [
  "停車場出入口",
  "垃圾收集站",
  "垃圾收集",
  "公共洗手間",
  "的士候車處",
  "的士候車",
  "的士站",
  "專線小巴",
  "小巴站",
  "巴士站",
  "電車站",
  "港鐵站",
  "港鐵",
  "地鐵站",
  "火車站",
  "進出口",
  "社區中心",
  "CommunityCentre",
  "遊樂場",
  "Playground",
  "圖書館",
  "體育館",
  "游泳池",
  "醫院",
  "Hospital",
  "診所",
  "戲院",
  "Cinema",
  "賓館",
  "GuestHouse",
  "超級市場",
  "Supermarket",
  "停車場",
  "CarPark",
  "智郵",
  "郵政局",
  "幼稚園",
  "小學",
  "中學",
  "教堂",
  "管理處",
  "物管處",
  "保安室",
  "垃圾房",
  "垃圾桶",
  "垃圾站",
  "泵房",
  "變壓站",
  "變壓器",
  "變壓",
  "電掣房",
  "洗手間",
  "公廁",
  "總站",
  "外面",
].sort((a, b) => b.length - a.length);

/** Short stems that appear inside real streets — only drop as a suffix. */
const AMBIGUOUS_NOISE = ["公園", "廟"];

/**
 * Clear commercial / industrial POI tokens. Do not add 中心／廣場 —
 * real private / HOS estates use those in the name (將軍澳中心、大埔廣場).
 */
const COMMERCIAL_POI_NOISE = [
  "ShoppingCentre",
  "ShoppingMall",
  "IndustrialBuilding",
  "CommercialBuilding",
  "購物中心",
  "購物商場",
  "商業大廈",
  "工業大廈",
  "工廠大廈",
  "寫字樓",
  "商場",
  "工廈",
  "酒店",
  "Hotel",
  "MTR",
  "Station",
].sort((a, b) => b.length - a.length);

const NOISE_TOKENS = [...FACILITY_NOISE, ...COMMERCIAL_POI_NOISE, ...AMBIGUOUS_NOISE].sort(
  (a, b) => b.length - a.length,
);

function longestNoiseToken(name: string): string | undefined {
  const hay = name.toLowerCase();
  return NOISE_TOKENS.find((token) => hay.includes(token.toLowerCase()));
}

function isFacilityRemainder(rest: string): boolean {
  const stripped = rest.replace(/[()（）[\]【】\-–—·.,，、\s近外]/g, "");
  if (!stripped) return false;
  return NOISE_TOKENS.some(
    (token) => stripped === compact(token) || stripped.endsWith(compact(token)),
  );
}

/**
 * Drop standalone / suffixed facilities (公廁、的士站、管理處)
 * and obvious commercial / industrial POIs (商場、工廈、寫字樓、酒店).
 * Keep a longer official name that only happens to contain 管理處.
 * Catalogue residential names win even when they contain a keyword.
 */
export function shouldDropAsNoise(name: string, knownName?: string): boolean {
  const title = name.replace(/\s+/g, "").trim();
  if (!title) return false;
  const token = longestNoiseToken(title);
  if (!token) return false;

  const titleKey = compact(title);
  const knownKey = knownName ? compact(knownName) : "";

  if (knownKey && titleKey === knownKey) return false;
  if (knownKey && titleKey.startsWith(knownKey)) {
    const rest = titleKey.slice(knownKey.length);
    if (isFacilityRemainder(rest)) return true;
    return false;
  }
  if (knownKey && titleKey.includes(knownKey) && knownKey.length >= 3) {
    const rest = titleKey.replace(knownKey, "");
    if (isFacilityRemainder(rest)) return true;
    return false;
  }

  if (AMBIGUOUS_NOISE.includes(token) && !title.endsWith(token)) return false;
  return true;
}

/** Short 「太古站」POIs. Keep catalogue aliases that only mention a station (啟德站). */
function isBareTransitStation(name: string, knownName?: string): boolean {
  const title = name.replace(/\s+/g, "").trim();
  if (!/站$/.test(title) && !/station$/i.test(title.replace(/\s+/g, ""))) return false;
  if (knownName) {
    const titleKey = compact(title);
    const knownKey = compact(knownName);
    if (titleKey === knownKey || titleKey.startsWith(knownKey)) return false;
  }
  const compactTitle = compact(title);
  return compactTitle.length <= 6 || (/站$/.test(title) && title.length <= 4);
}

/** Catalogue longest-match, then {@link shouldDropAsNoise}. */
export function isImpracticalPlace(name: string, address = ""): boolean {
  const known = matchKnownEstate(name, address);
  const knownName = known && HOUSING_VALUES.includes(known.housing) ? known.name : undefined;
  if (shouldDropAsNoise(name, knownName)) return true;
  return isBareTransitStation(name, knownName);
}
