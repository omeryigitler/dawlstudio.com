export interface Product {
  id: string;
  edition: "Retail" | "Premium";
  color: "White" | "Black";
  scent: "01" | "02";
  size: string;
  name: string;
  price: string;
  image?: string;
  description?: string;
}

export const PRODUCTS: Product[] = [
  { 
    id: "DS-R-W-01-220", 
    edition: "Retail", 
    color: "White", 
    scent: "01", 
    size: "220g", 
    name: "Cedarwood — Amber", 
    price: "€65",
    image: "https://lh3.googleusercontent.com/d/1o0Eu7XnS36D6_ymZHLphJ6LnzhSzV0AP",
    description: "A grounding, warm scent evoking the quiet sanctuary of a Maltese palazzo at dusk."
  },
  { 
    id: "DS-R-B-01-220", 
    edition: "Retail", 
    color: "Black", 
    scent: "01", 
    size: "220g", 
    name: "Cedarwood — Amber", 
    price: "€65",
    image: "https://lh3.googleusercontent.com/d/18p4KjobpnEl_pwu059ncH_t1ypposF3K",
    description: "A grounding, warm scent evoking the quiet sanctuary of a Maltese palazzo at dusk."
  },
  { 
    id: "DS-R-W-02-220", 
    edition: "Retail", 
    color: "White", 
    scent: "02", 
    size: "220g", 
    name: "Limestone — Frankincense", 
    price: "€65",
    image: "https://lh3.googleusercontent.com/d/1ubXCr1yEKar1hpVnQ1_f7Xfd0ES1yOtT",
    description: "A mineral, airy scent capturing the essence of sun-baked limestone and ancient rituals."
  },
  { 
    id: "DS-R-B-02-220", 
    edition: "Retail", 
    color: "Black", 
    scent: "02", 
    size: "220g", 
    name: "Limestone — Frankincense", 
    price: "€65",
    image: "https://lh3.googleusercontent.com/d/1IsSJ7nBb8kxXsE4bN_QI3kgbuplbc56t",
    description: "A mineral, airy scent capturing the essence of sun-baked limestone and ancient rituals."
  },
  { 
    id: "DS-P-W-01-220", 
    edition: "Premium", 
    color: "White", 
    scent: "01", 
    size: "220g", 
    name: "Cedarwood — Amber", 
    price: "€95",
    image: "https://lh3.googleusercontent.com/d/1J4qDFUWtfG1qdXqnX3OHqxB-_eLBKIvA",
    description: "A grounding, warm scent evoking the quiet sanctuary of a Maltese palazzo at dusk."
  },
  { 
    id: "DS-P-B-01-220", 
    edition: "Premium", 
    color: "Black", 
    scent: "01", 
    size: "220g", 
    name: "Cedarwood — Amber", 
    price: "€95",
    image: "https://lh3.googleusercontent.com/d/1cx9w53i5q49VEXZfsp923vTIUwYys1Sn",
    description: "A grounding, warm scent evoking the quiet sanctuary of a Maltese palazzo at dusk."
  },
  { 
    id: "DS-P-W-02-220", 
    edition: "Premium", 
    color: "White", 
    scent: "02", 
    size: "220g", 
    name: "Limestone — Frankincense", 
    price: "€95",
    image: "https://lh3.googleusercontent.com/d/1dLrpZou4pSsmaf8XjY8mkZOxysMxjy6W",
    description: "A mineral, airy scent capturing the essence of sun-baked limestone and ancient rituals."
  },
  { 
    id: "DS-P-B-02-220", 
    edition: "Premium", 
    color: "Black", 
    scent: "02", 
    size: "220g", 
    name: "Limestone — Frankincense", 
    price: "€95",
    image: "https://lh3.googleusercontent.com/d/1mZOIKtYuMK72gwu4vUrPUTCc-X7P69L2",
    description: "A mineral, airy scent capturing the essence of sun-baked limestone and ancient rituals."
  },
];
