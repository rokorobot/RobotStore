import { Unit } from "@/types/unit";

/**
 * GOLDEN TEST FIXTURES
 * 
 * This is an immutable dataset used for regression testing.
 * DO NOT modify these units unless the engine scoring logic has a 
 * fundamental, intentional shift in weighting.
 */
export const goldenUnits: Unit[] = [
  {
    id: "unit-domestic-1",
    slug: "rs-vaccum-pro",
    sku: "SKU-DOM-1",
    name: "RS Vacuum Pro",
    subtitle: "Home Assistance",
    brand: "RokoRobo",
    classSlug: "domestic-assistance",
    description: "Standard domestic assistance unit.",
    shortDescription: "Pro-grade home cleaning robot.",
    priceCents: 89900,
    currency: "USD",
    purchaseMode: "buy_now",
    status: "available",
    featured: false,
    images: [],
    specs: { mobility: "wheeled", runtime: "4h" },
    capabilities: ["vacuum", "mopping", "mapping"],
    behavioralProfile: ["quiet", "low-noise"],
    deploymentFit: ["home", "residential"]
  },
  {
    id: "unit-industrial-1",
    slug: "rs-heavy-lift-x",
    sku: "SKU-IND-1",
    name: "RS Heavy Lift X",
    subtitle: "Industrial Logistics",
    brand: "RokoRobo",
    classSlug: "industrial-systems",
    description: "Industrial grade heavy lifter.",
    shortDescription: "High-capacity warehouse logistics.",
    priceCents: 1250000,
    currency: "USD",
    purchaseMode: "partner_quote",
    status: "available",
    featured: true,
    images: [],
    specs: { payload: "500kg", mobility: "tracked" },
    capabilities: ["lifting", "pallet-moving", "fleet"],
    behavioralProfile: ["rugged", "reliable"],
    deploymentFit: ["warehouse", "fulfillment", "manufacturing"]
  },
  {
    id: "unit-security-1",
    slug: "rs-sentinel-v2",
    sku: "SKU-SEC-1",
    name: "RS Sentinel v2",
    subtitle: "Security Nodes",
    brand: "RokoRobo",
    classSlug: "security-nodes",
    description: "Advanced surveillance node.",
    shortDescription: "Autonomous perimeter security.",
    priceCents: 450000,
    currency: "USD",
    purchaseMode: "buy_now",
    status: "available",
    featured: true,
    images: [],
    specs: { mobility: "four-legged", sensors: "night-vision" },
    capabilities: ["surveillance", "intrusion-detection", "patrol"],
    behavioralProfile: ["alert", "weather-resistant"],
    deploymentFit: ["office", "corporate", "campus", "outdoor"]
  },
  {
    id: "unit-humanoid-1",
    slug: "rs-nexus-alpha",
    sku: "SKU-HUM-1",
    name: "RS Nexus Alpha",
    subtitle: "Humanoid Interfaces",
    brand: "RokoRobo",
    classSlug: "humanoid-interfaces",
    description: "Multi-environment versatile interface.",
    shortDescription: "General purpose humanoid.",
    priceCents: 4500000,
    currency: "USD",
    purchaseMode: "partner_quote",
    status: "waitlist_open",
    featured: false,
    images: [],
    specs: { mobility: "bipedal", sensors: "multi-modal" },
    capabilities: ["manipulation", "voice-interaction", "swarm"],
    behavioralProfile: ["human-like", "adaptable"],
    deploymentFit: ["mixed", "hospital", "lab", "residential"]
  }
];
