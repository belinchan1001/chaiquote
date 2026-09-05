import { createServerFn } from "@tanstack/react-start";
import { CATEGORY_LABEL, HOUSING_LABEL, type Category, type Housing } from "@/lib/plans";
import { CALL_WINDOWS, SITE } from "@/lib/site";

export type LeadPayload = {
  name: string;
  phone: string;
  housing: string;
  district: string;
  estate: string;
  category: string;
  callWindow: string;
  notes: string;
  plans: string;
};

function windowLabel(id: string) {
  return CALL_WINDOWS.find((item) => item.id === id)?.label ?? id;
}

export function formatLeadEmail(input: LeadPayload) {
  const housing =
    input.housing in HOUSING_LABEL ? HOUSING_LABEL[input.housing as Housing] : input.housing;
  const category =
    input.category in CATEGORY_LABEL ? CATEGORY_LABEL[input.category as Category] : input.category;
  const lines = [
    "【齊Quote 請致電客人】",
    `姓名：${input.name}`,
    `電話：${input.phone}`,
    `方便致電：${windowLabel(input.callWindow) || "未填"}`,
    input.estate ? `申請地址：${input.estate}` : "",
    housing ? `樓宇類型：${housing}` : "",
    input.district ? `地區：${input.district}` : "",
    category ? `想問：${category}` : "",
    input.plans ? `已選計劃：${input.plans}` : "",
    input.notes ? `備註：${input.notes}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export function leadSubject(input: LeadPayload) {
  const place = input.estate || input.district || "未填地址";
  return `【齊Quote 回覆】${input.name} ${input.phone} · ${place}`;
}

export const sendLead = createServerFn({ method: "POST" })
  .inputValidator((data: LeadPayload) => data)
  .handler(async ({ data }) => {
    const inbox = (process.env.LEAD_EMAIL || SITE.leadEmail).trim();
    if (!inbox) {
      return { ok: false as const, reason: "no-inbox" as const };
    }
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: leadSubject(data),
        _template: "box",
        內容: formatLeadEmail(data),
        姓名: data.name,
        電話: data.phone,
        方便致電: windowLabel(data.callWindow),
        申請地址: data.estate,
        樓宇類型: data.housing,
        地區: data.district,
        想問: data.category,
        已選計劃: data.plans,
        備註: data.notes,
      }),
    });
    if (!res.ok) {
      return { ok: false as const, reason: "send-failed" as const };
    }
    return { ok: true as const };
  });
