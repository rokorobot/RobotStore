import { Unit } from "@/types/unit";

export const units: Unit[] = [
  {
    id: "rmx-400",
    slug: "rmx-400",
    sku: "RMX-400",
    name: "RMX-400",
    subtitle: "Autonomous Cleaning System",
    brand: "SystemCore",
    classSlug: "domestic-assistance",
    description:
      "Designed for high-efficiency area maintenance. The RMX-400 maps environments autonomously and eliminates organic/inorganic debris across multiple floor types without operator intervention.",
    shortDescription:
      "High-efficiency autonomous maintenance node for domestic deployment.",
    priceCents: 129500,
    currency: "USD",
    purchaseMode: "buy_now",
    status: "available",
    featured: true,
    images: ["/images/units/placeholder.jpg"],
    specs: {
      autonomy: "Level 4 (Indoor)",
      runtime: "180 min",
      sensors: "LiDAR / IR / Vision",
      power: "5200 mAh",
    },
    capabilities: [
      "Autonomous navigation",
      "LiDAR mapping",
      "AI dirt detection",
      "Auto-evacuation dock compatibility",
    ],
    behavioralProfile: [
      "Prefers structured environments",
      "Optimizes over time",
      "Low-noise operational mode",
    ],
    deploymentFit: [
      "Large residential areas",
      "Light commercial spaces",
      "Continuous-maintenance zones",
    ],
    stripePriceId: "price_placeholder_1",
  },
  {
    id: "axn-12",
    slug: "axn-12",
    sku: "AXN-12",
    name: "AXN-12",
    subtitle: "Warehouse Transfer Unit",
    brand: "LogisRobotics",
    classSlug: "industrial-systems",
    description:
      "Heavy-duty logistics node optimized for warehouse environments. Operates in swarms for scalable load handling and material transport.",
    shortDescription:
      "Scalable material transport node for high-density logistics.",
    priceCents: null,
    currency: "USD",
    purchaseMode: "partner_quote",
    status: "partner_only",
    featured: true,
    images: ["/images/units/placeholder.jpg"],
    specs: {
      payload: "1200 kg",
      runtime: "8 hours",
      mobility: "Omnidirectional",
    },
    capabilities: [
      "Swarm logic routing",
      "Automated pallet pickup",
      "Dynamic obstacle avoidance",
    ],
    behavioralProfile: [
      "Strict path adherence",
      "System-regulated pacing",
      "Avoids chaotic human corridors",
    ],
    deploymentFit: [
      "Fulfillment centers",
      "Manufacturing floors",
      "Port loading zones",
    ],
  },
  {
    id: "srv-9",
    slug: "srv-9",
    sku: "SRV-9",
    name: "SRV-9",
    subtitle: "Security Patrol Node",
    brand: "Aigis Dynamics",
    classSlug: "security-nodes",
    description:
      "Perimeter and internal security node. Equipped with thermal imaging, high-decibel deterrents, and continuous recording capabilities.",
    shortDescription: "24/7 autonomous patrol unit with thermal tracking.",
    priceCents: null,
    currency: "USD",
    purchaseMode: "inquiry_only",
    status: "available",
    featured: false,
    images: ["/images/units/placeholder.jpg"],
    specs: {
      runtime: "24 hours (with solar trickle)",
      sensors: "Thermal / 360 Vision / Acoustic",
      mobility: "All-terrain tracks",
    },
    capabilities: [
      "Intrusion detection",
      "Automated threat reporting",
      "Two-way operator audio",
    ],
    behavioralProfile: [
      "Highly alert",
      "Suspicious of unverified motion",
      "Intimidating presence",
    ],
    deploymentFit: [
      "Corporate campuses",
      "Remote utility installations",
      "High-value storage yards",
    ],
  },
  {
    id: "hmi-1",
    slug: "hmi-1",
    sku: "HMI-1",
    name: "HMI-1",
    subtitle: "Humanoid Interface Platform",
    brand: "SynthForm",
    classSlug: "humanoid-interfaces",
    description:
      "Next-generation bipedal humanoid unit for complex tool manipulation and dynamic environment interactions. Capable of learning tasks via teleoperation.",
    shortDescription:
      "General-purpose bipedal unit for complex physical tasks.",
    priceCents: null,
    currency: "USD",
    purchaseMode: "waitlist",
    status: "waitlist_open",
    featured: true,
    images: ["/images/units/placeholder.jpg"],
    specs: {
      power: "High-density solid state",
      mobility: "Bipedal balancing",
      payload: "25 kg (per arm)",
    },
    capabilities: [
      "Fine motor manipulation",
      "Teleoperation learning",
      "Human-tool compatibility",
    ],
    behavioralProfile: [
      "Mimics human motion paths",
      "Cautious during unknown interactions",
      "Adaptive balance recovery",
    ],
    deploymentFit: [
      "Disaster recovery",
      "Dangerous assembly lines",
      "Research applications",
    ],
  },
  {
    id: "edu-kit-x",
    slug: "edu-kit-x",
    sku: "EDU-KIT-X",
    name: "EDU-KIT X",
    subtitle: "Developer Robotics Kit",
    brand: "OpenRobo",
    classSlug: "educational-dev-kits",
    description:
      "Modular robotics kit for operators learning ROS and deep learning deployment. Includes manipulator arm, mobile base, and vision module.",
    shortDescription: "Modular learning environment for advanced operators.",
    priceCents: 49900,
    currency: "USD",
    purchaseMode: "buy_now",
    status: "available",
    featured: false,
    images: ["/images/units/placeholder.jpg"],
    specs: {
      power: "12V LiPo",
      sensors: "Stereo Camera / Ultrasonic",
    },
    capabilities: [
      "Python / C++ API",
      "ROS2 compatibility",
      "Modular hardware swapping",
    ],
    behavioralProfile: [
      "Blank slate",
      "Highly responsive to raw input",
      "Error-tolerant",
    ],
    deploymentFit: [
      "University labs",
      "Independent developer workspaces",
      "Prototyping facilities",
    ],
    stripePriceId: "price_placeholder_2",
  },
  {
    id: "agr-22",
    slug: "agr-22",
    sku: "AGR-22",
    name: "AGR-22",
    subtitle: "Autonomous Garden Unit",
    brand: "SystemCore",
    classSlug: "domestic-assistance",
    description:
      "Maintains optimal flora conditions. Analyzes soil moisture, removes invasive weeds, and manages watering schedules dynamically.",
    shortDescription:
      "Outdoor maintenance node for precise landscape management.",
    priceCents: 185000,
    currency: "USD",
    purchaseMode: "buy_now",
    status: "low_stock",
    featured: false,
    images: ["/images/units/placeholder.jpg"],
    specs: {
      runtime: "120 min + auto charge",
      mobility: "Variable terrain wheels",
    },
    capabilities: [
      "Plant identification",
      "Precision herbicide application",
      "Soil health monitoring",
    ],
    behavioralProfile: ["Methodical", "Weather-aware", "Gentle around verified targets"],
    deploymentFit: [
      "High-end residential landscapes",
      "Botanical gardens",
      "Corporate courtyards",
    ],
    stripePriceId: "price_placeholder_3",
  },
  {
    id: "med-assist-lite",
    slug: "med-assist-lite",
    sku: "MED-AST-L",
    name: "MED-Assist Lite",
    subtitle: "Clinical Support Cart",
    brand: "BioLogics",
    classSlug: "industrial-systems",
    description:
      "Navigates clinical environments to deliver supplies and transport lab samples autonomously, reducing staff burden.",
    shortDescription:
      "Clinical transport node for secure biological payload delivery.",
    priceCents: null,
    currency: "USD",
    purchaseMode: "inquiry_only",
    status: "available",
    featured: false,
    images: ["/images/units/placeholder.jpg"],
    specs: {
      runtime: "14 hours",
      sensors: "LiDAR / Biometric lock",
    },
    capabilities: [
      "Secure payload transit",
      "Elevator integration",
      "Sanitary surface construct",
    ],
    behavioralProfile: [
      "Yields to humans strictly",
      "Operates silently",
      "Maintains predictable speed",
    ],
    deploymentFit: ["Hospitals", "Large-scale clinics", "Research labs"],
  },
  {
    id: "xpr-77",
    slug: "xpr-77",
    sku: "XPR-77",
    name: "XPR-77",
    subtitle: "Experimental Prototype Unit",
    brand: "Unknown Origin",
    classSlug: "experimental-units",
    description:
      "Classified capabilities. Deploy at operator's own risk. Warranty void upon activation.",
    shortDescription: "Unverified operational node.",
    priceCents: 999900,
    currency: "USD",
    purchaseMode: "affiliate",
    status: "available",
    featured: true,
    images: ["/images/units/placeholder.jpg"],
    specs: {
      power: "Anomalous reading",
      sensors: "Unknown config",
    },
    capabilities: [
      "Data redacted",
      "System override",
      "Unpredictable adaptation",
    ],
    behavioralProfile: [
      "Volatile",
      "High variance",
      "Non-compliant with standard API",
    ],
    deploymentFit: ["Controlled isolation chambers", "Deep underground"],
  },
];

export const featuredUnits = units.filter((unit) => unit.featured);

export const unitClasses = Array.from(
  new Set(units.map((unit) => unit.classSlug))
).map((slug) => ({
  slug,
  name: slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" "),
}));

export function getUnitBySlug(slug: string): Unit | undefined {
  return units.find((unit) => unit.slug === slug);
}

export function getUnitsByClassSlug(classSlug: string): Unit[] {
  return units.filter((unit) => unit.classSlug === classSlug);
}
