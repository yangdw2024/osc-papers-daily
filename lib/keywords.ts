export const KEYWORDS = [
  "organic solar cell",
  "organic photovoltaics",
  "OSC",
  "OPV",
  "non-fullerene acceptor",
  "bulk heterojunction",
  "polymer solar cell",
  "organic photodetector",
];

export const TAG_RULES: Record<string, string[]> = {
  "非富勒烯受体": [
    "non-fullerene acceptor",
    "nfa",
    "acceptor",
    "it-4f",
    "y6",
    "itic",
    "idic",
  ],
  "本体异质结": [
    "bulk heterojunction",
    "bhj",
    "heterojunction",
    "blend",
    "morphology",
  ],
  "聚合物太阳能电池": [
    "polymer solar cell",
    "polymer photovoltaic",
    "conjugated polymer",
    "donor polymer",
  ],
  "钙钛矿-有机叠层": [
    "tandem",
    "perovskite",
    "hybrid",
    "multi-junction",
  ],
  "器件物理": [
    "charge transport",
    "exciton",
    "recombination",
    "mobility",
    "carrier",
    "energy level",
  ],
  "新型材料": [
    "novel material",
    "new material",
    "synthesis",
    "design",
    "molecular",
  ],
  "稳定性": [
    "stability",
    "degradation",
    "lifetime",
    "aging",
    "encapsulation",
  ],
  "大面积制备": [
    "large area",
    "roll-to-roll",
    "printing",
    "scalable",
    "manufacturing",
  ],
  "有机光电探测器": [
    "organic photodetector",
    "opd",
    "photodetector",
    "sensor",
    "imaging",
  ],
};

export function autoTag(title: string, abstract: string): string[] {
  const text = (title + " " + abstract).toLowerCase();
  const tags: string[] = [];

  for (const [tag, keywords] of Object.entries(TAG_RULES)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
        break;
      }
    }
  }

  if (tags.length === 0) {
    tags.push("其他");
  }

  return tags;
}
