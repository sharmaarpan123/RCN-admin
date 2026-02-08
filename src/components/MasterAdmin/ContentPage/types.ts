/** CMS page item from GET /api/admin/cms (list or by id). */
export type AdminCmsPageItem = {
  _id: string;
  name?: string;
  slug?: string;
  content?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  [key: string]: unknown;
};

/** Row type for CMS table. */
export type CmsTableRow = AdminCmsPageItem;

/** Shared style classes. */
export const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
export const BTN_CLASS =
  "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
export const BTN_SMALL_CLASS =
  "border cursor-pointer border-rcn-border bg-white px-2.5 py-2 rounded-xl text-xs font-semibold hover:border-[#c9ddd0] transition-colors";
export const BTN_PRIMARY_CLASS =
  "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";
