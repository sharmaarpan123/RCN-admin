import * as yup from "yup";

export const PLACEMENTS = ["left_sidebar", "header_strip"] as const;
export const PLACEMENT_OPTIONS = [
  { value: "left_sidebar", label: "Left Sidebar" },
  { value: "header_strip", label: "Header Strip" },
];

export const SCOPES = ["organization_specific", "global"] as const;
export const SCOPE_OPTIONS = [
  { value: "organization_specific", label: "Organization-specific" },
  { value: "global", label: "Global" },
];

/** Banner as returned from API (use as-is). */
export type ApiBanner = {
  _id?: string;
  id?: string;
  name: string;
  link_url?: string;
  placement: string;
  scope: string;
  organization_id?: string | null;
  status: number;
  start_date?: string | null;
  end_date?: string | null;
  image_url?: string | null;
  alt_text?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

const yesterdayEnd = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const bannerFormSchema = (isEdit: boolean) => yup.object({
  name: yup.string().trim().required("Banner name is required."),
  link_url: yup.string().trim().optional().default(""),
  placement: yup.string().oneOf([...PLACEMENTS]).required().default("left_sidebar"),
  scope: yup.string().oneOf([...SCOPES]).required().default("global"),
  organization_id: yup.string().trim().optional().default(""),
  status: yup.number().oneOf([0, 1]).required().default(1),
  start_date: yup
    .string()
    .trim()
    .optional()
    .default("")
    .test(
      "start-after-today",
      "Start date must be after today.",
      (value) => isEdit ? true : !value || new Date(value) > yesterdayEnd()
    ),
  end_date: yup
    .string()
    .trim()
    .optional()
    .default("")
    .test(
      "end-after-start",
      "End date must be after start date.",
      function (value) {
        if (!value) return true;
        const start = this.parent.start_date as string | undefined;
        if (!start) return true;
        return new Date(value) > new Date(start);
      }
    ),
  image_url: yup.string().trim().required("Image is required.").default(""),
  alt_text: yup.string().trim().optional().default(""),
  notes: yup.string().trim().optional().default(""),
});

export type BannerFormValues = yup.InferType<ReturnType<typeof bannerFormSchema>>;

export const defaultFormValues: BannerFormValues = {
  name: "",
  link_url: "",
  placement: "left_sidebar",
  scope: "global",
  organization_id: "",
  status: 1,
  start_date: "",
  end_date: "",
  image_url: "",
  alt_text: "",
  notes: "",
};

export const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";

export function getBannerId(b: ApiBanner): string {
  return b._id ?? b.id ?? "";
}

export function placementLabel(p: string): string {
  const o = PLACEMENT_OPTIONS.find((x) => x.value === p);
  return o ? o.label : p.replace(/_/g, " ");
}

export function isInDateRange(b: ApiBanner): boolean {
  const now = new Date();
  if (b.start_date) {
    const start = new Date(b.start_date);
    if (now < start) return false;
  }
  if (b.end_date) {
    const end = new Date(b.end_date);
    if (now > end) return false;
  }
  return true;
}

export function bannerToFormValues(b: ApiBanner): BannerFormValues {
  return {
    name: b.name ?? "",
    link_url: b.link_url ?? "",
    placement: (b.placement ?? "right_sidebar") as BannerFormValues["placement"],
    scope: (b.scope ?? "global") as BannerFormValues["scope"],
    organization_id: b.organization_id ?? "",
    status: b.status ?? 1,
    start_date: b.start_date ? String(b.start_date).slice(0, 16) : "",
    end_date: b.end_date ? String(b.end_date).slice(0, 16) : "",
    image_url: b.image_url ?? "",
    alt_text: b.alt_text ?? "",
    notes: b.notes ?? "",
  };
}
