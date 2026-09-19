# PRH block catalogue pipeline

## Source

- Dataset: [Housing Authority's Public Rental Housing Stock](https://data.gov.hk/en-data/dataset/hk-housing-emms-emms-housing-stock) (last updated 2026-06-22 on data.gov.hk)
- Export: `https://data.housingauthority.gov.hk/psi/rest/export/ha_prhs/{district}/en/csv` (English CSV — includes Chinese estate / block fields)
- Districts: `ha_prhs_a`, `ha_prhs_b`, `ha_prhs_c`, `ha_prhs_d`, `ha_prhs_e`, `ha_prhs_f`, `ha_prhs_g`, `ha_prhs_h`, `ha_prhs_j`, `ha_prhs_k`, `ha_prhs_l`, `ha_prhs_m`, `ha_prhs_n`, `ha_prhs_p`, `ha_prhs_q`, `ha_prhs_r`, `ha_prhs_s`, `ha_prhs_t`
- Generated: 2026-09-19 (from `--cache-dir`)

Same family as #105 Lok Fu (`ha_prhs_h`, `estate_chinese_name` / `chinese_name_of_block`).

## Gates

1. Insert block names from HA only. Estate mismatches go to [skipped.md](./skipped.md) — no force-match.
2. No short CJK aliases (avoids 樂民 / 樂翠 collisions). English is added only when that compact key is unique.
3. Flash-unlock and hierarchical skip logic are unchanged.
4. Hand-maintained Lok Fu / 東頭 / 美東 / 曉茵 / 海富 rows are not rewritten.

## Counts

| Metric | n |
| --- | ---: |
| HA estates in stock files | 249 |
| Catalogue PRH 邨／苑 parents matched | 228 |
| Estates that gained new block rows | 220 |
| New catalogue rows inserted | 1521 |
| HA blocks already in hand-maintained RAW | 42 |
| HA estates skipped | 11 |
| Catalogue PRH parents skipped | 17 |
| HA blocks skipped | 63 |

## Sample acceptance

| Estate | HA name(s) used | Already sourced | New rows | Sample blocks |
| --- | --- | --- | --- | --- |
| 樂富邨 | 樂富邨 | 11 kept | 0 inserted | 宏旭樓、宏康樓、宏逸樓 |
| 天耀邨 | 天耀一邨、天耀二邨 | 0 kept | 12 inserted | 耀昌樓、耀富樓、耀華樓 |
| 華富邨 | 華富一邨、華富二邨 | 0 kept | 18 inserted | 華生樓、華光樓、華安樓 |
| 尚德邨 | 尚德邨 | 0 kept | 9 inserted | 尚仁樓、尚明樓、尚信樓 |
| 水泉澳邨 | 水泉澳邨 | 0 kept | 18 inserted | 山泉樓、月泉樓、竹泉樓 |
| 東頭邨 | 東頭二邨 | 20 kept | 0 inserted | 安東樓、旺東樓、欣東樓 |

Yoho / 嘉湖 ranking and flash-unlock are covered by existing tests (unchanged).
