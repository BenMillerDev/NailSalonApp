// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface Service {
  id: string;
  category: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  addOns: string[];
}

export interface AddOn {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface NailLength {
  id: string;
  label: string;
  extraDuration: number;
  extraPrice: number;
}

export interface FillReminders {
  [serviceId: string]: number;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

export const SERVICE_CATEGORIES = {
  NAILS: "Nails",
  LASHES: "Lashes",
  BROWS: "Brows",
} as const;

export const DEFAULT_SERVICES: Service[] = [
  // --- NAIL SERVICES ---
  {
    id: "classic-manicure",
    category: SERVICE_CATEGORIES.NAILS,
    name: "Classic Manicure",
    description: "Shape, cuticle care, and polish of your choice",
    duration: 45,
    price: 35,
    addOns: ["nail-art", "paraffin-wax"],
  },
  {
    id: "gel-manicure",
    category: SERVICE_CATEGORIES.NAILS,
    name: "Gel Manicure",
    description: "Long-lasting gel polish with shape and cuticle care",
    duration: 60,
    price: 50,
    addOns: ["nail-art", "gel-removal"],
  },
  {
    id: "acrylic-full-set",
    category: SERVICE_CATEGORIES.NAILS,
    name: "Acrylic Full Set",
    description:
      "Full set of acrylic nails with your choice of shape and length",
    duration: 90,
    price: 75,
    addOns: ["nail-art", "ombre", "chrome-powder"],
  },
  {
    id: "acrylic-fill",
    category: SERVICE_CATEGORIES.NAILS,
    name: "Acrylic Fill",
    description: "Fill in grown out acrylic nails",
    duration: 60,
    price: 50,
    addOns: ["nail-art", "shape-change"],
  },
  {
    id: "classic-pedicure",
    category: SERVICE_CATEGORIES.NAILS,
    name: "Classic Pedicure",
    description: "Soak, shape, cuticle care, and polish",
    duration: 60,
    price: 45,
    addOns: ["paraffin-wax", "callus-removal"],
  },
  {
    id: "gel-pedicure",
    category: SERVICE_CATEGORIES.NAILS,
    name: "Gel Pedicure",
    description: "Pedicure with long-lasting gel polish",
    duration: 75,
    price: 60,
    addOns: ["paraffin-wax", "callus-removal"],
  },
  {
    id: "gel-removal",
    category: SERVICE_CATEGORIES.NAILS,
    name: "Gel Removal",
    description: "Safe removal of existing gel polish",
    duration: 30,
    price: 15,
    addOns: [],
  },
  {
    id: "acrylic-removal",
    category: SERVICE_CATEGORIES.NAILS,
    name: "Acrylic Removal",
    description: "Safe soak-off removal of acrylic nails",
    duration: 45,
    price: 20,
    addOns: [],
  },

  // --- LASH SERVICES ---
  {
    id: "lash-classic-full",
    category: SERVICE_CATEGORIES.LASHES,
    name: "Classic Lash Full Set",
    description: "One extension per natural lash for a natural, defined look",
    duration: 120,
    price: 120,
    addOns: ["lash-bath"],
  },
  {
    id: "lash-hybrid-full",
    category: SERVICE_CATEGORIES.LASHES,
    name: "Hybrid Lash Full Set",
    description: "Mix of classic and volume fans for a textured look",
    duration: 135,
    price: 145,
    addOns: ["lash-bath"],
  },
  {
    id: "lash-volume-full",
    category: SERVICE_CATEGORIES.LASHES,
    name: "Volume Lash Full Set",
    description: "Multiple extensions per lash for a dramatic, full look",
    duration: 150,
    price: 165,
    addOns: ["lash-bath"],
  },
  {
    id: "lash-classic-fill",
    category: SERVICE_CATEGORIES.LASHES,
    name: "Classic Lash Fill",
    description: "Fill in grown out classic lash extensions",
    duration: 60,
    price: 65,
    addOns: [],
  },
  {
    id: "lash-hybrid-fill",
    category: SERVICE_CATEGORIES.LASHES,
    name: "Hybrid Lash Fill",
    description: "Fill in grown out hybrid lash extensions",
    duration: 75,
    price: 80,
    addOns: [],
  },
  {
    id: "lash-volume-fill",
    category: SERVICE_CATEGORIES.LASHES,
    name: "Volume Lash Fill",
    description: "Fill in grown out volume lash extensions",
    duration: 90,
    price: 95,
    addOns: [],
  },
  {
    id: "lash-removal",
    category: SERVICE_CATEGORIES.LASHES,
    name: "Lash Removal",
    description: "Safe removal of lash extensions",
    duration: 30,
    price: 25,
    addOns: [],
  },

  // --- BROW SERVICES ---
  {
    id: "brow-wax",
    category: SERVICE_CATEGORIES.BROWS,
    name: "Brow Wax & Shape",
    description: "Wax and shape brows to your desired look",
    duration: 20,
    price: 18,
    addOns: [],
  },
  {
    id: "brow-lamination",
    category: SERVICE_CATEGORIES.BROWS,
    name: "Brow Lamination",
    description: "Straighten and set brow hairs for a fluffy, full look",
    duration: 45,
    price: 75,
    addOns: ["brow-tint", "brow-wax"],
  },
  {
    id: "brow-tint",
    category: SERVICE_CATEGORIES.BROWS,
    name: "Brow Tint",
    description: "Semi-permanent tint to define and darken brows",
    duration: 20,
    price: 25,
    addOns: [],
  },
];

export const ADD_ONS: AddOn[] = [
  { id: "nail-art", name: "Nail Art", duration: 15, price: 10 },
  { id: "ombre", name: "Ombré", duration: 15, price: 15 },
  { id: "chrome-powder", name: "Chrome Powder", duration: 10, price: 10 },
  {
    id: "paraffin-wax",
    name: "Paraffin Wax Treatment",
    duration: 15,
    price: 12,
  },
  { id: "callus-removal", name: "Callus Removal", duration: 15, price: 10 },
  { id: "shape-change", name: "Shape Change", duration: 10, price: 10 },
  { id: "gel-removal", name: "Gel Removal", duration: 30, price: 15 },
  { id: "lash-bath", name: "Lash Bath", duration: 10, price: 10 },
  { id: "brow-tint", name: "Brow Tint", duration: 20, price: 25 },
  { id: "brow-wax", name: "Brow Wax", duration: 20, price: 18 },
];

export const NAIL_SHAPES: string[] = [
  "Square",
  "Round",
  "Oval",
  "Squoval",
  "Almond",
  "Stiletto",
  "Coffin",
  "Flare",
];

export const NAIL_LENGTHS: NailLength[] = [
  { id: "short", label: "Short", extraDuration: 0, extraPrice: 0 },
  { id: "medium", label: "Medium", extraDuration: 0, extraPrice: 0 },
  { id: "long", label: "Long", extraDuration: 15, extraPrice: 10 },
  { id: "xl", label: "XL", extraDuration: 20, extraPrice: 15 },
];

export const FILL_REMINDERS: FillReminders = {
  "acrylic-fill": 21,
  "gel-manicure": 14,
  "lash-classic-fill": 21,
  "lash-hybrid-fill": 21,
  "lash-volume-fill": 21,
};
