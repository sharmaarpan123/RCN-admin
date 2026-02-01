// Mock data for Banners

export interface Banner {
  id: string;
  name: string;
  placement: string;
  scope: string;
  orgId: string | null;
  active: boolean;
  startAt: string;
  endAt: string;
  imageData: string;
  imageUrl: string;
  linkUrl: string;
  alt: string;
  notes: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

const defaultBannerSvgData = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="250">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#0b3b24"/>
        <stop offset="1" stop-color="#18a05f"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="18" fill="url(#g)"/>
    <text x="50%" y="46%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#ffffff" font-weight="700">RCN Banner</text>
    <text x="50%" y="62%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#eafff3">Advertising / Announcement</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
};

export const MOCK_BANNERS: Banner[] = [
  {
    id: "banner_rcn",
    name: "RCN Sponsored Banner",
    placement: "RIGHT_SIDEBAR",
    scope: "GLOBAL",
    orgId: null,
    active: true,
    startAt: "",
    endAt: "",
    imageData: defaultBannerSvgData(),
    imageUrl: "",
    linkUrl: "",
    alt: "RCN Banner",
    notes: "",
    createdAt: new Date().toISOString(),
    createdBy: "system",
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  },
];

export const MOCK_ORGS_BANNERS = [
  {
    id: "org_northlake",
    name: "Northlake Medical Group",
    address: {
      state: "IL",
      zip: "60601",
    },
  },
  {
    id: "org_evergreen",
    name: "Evergreen Imaging Center",
    address: {
      state: "IL",
      zip: "60563",
    },
  },
  {
    id: "org_sunrise",
    name: "Sunrise Specialty Clinic",
    address: {
      state: "TX",
      zip: "77002",
    },
  },
];
