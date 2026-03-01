import {
  IntentExtractor,
  splitIntoClauses,
  estimateComplexity,
  extractKeywords,
  containsHedging,
  computeConfidence,
  createIntent,
} from "../../../../../src/node/mia/pde-engine/intent-extractor"

describe("IntentExtractor utilities", () => {
  describe("splitIntoClauses", () => {
    it("should split on periods", () => {
      const clauses = splitIntoClauses("Build a login form. Add validation. Deploy to production.")
      expect(clauses).toHaveLength(3)
      expect(clauses[0]).toBe("Build a login form")
    })

    it("should split on newlines", () => {
      const clauses = splitIntoClauses("Build a login form\nAdd validation\nDeploy to production")
      expect(clauses).toHaveLength(3)
    })

    it("should split on semicolons", () => {
      const clauses = splitIntoClauses("Build a form; add styles; test everything")
      expect(clauses).toHaveLength(3)
    })

    it("should filter empty strings", () => {
      const clauses = splitIntoClauses("Build a form.. Add validation...")
      expect(clauses.every((c) => c.length > 0)).toBe(true)
    })

    it("should handle numbered lists", () => {
      const clauses = splitIntoClauses("1. Build a form 2. Add validation 3. Test everything")
      expect(clauses.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe("estimateComplexity", () => {
    it("should classify trivial tasks", () => {
      expect(estimateComplexity("rename the variable")).toBe("trivial")
    })

    it("should classify low complexity", () => {
      expect(estimateComplexity("add a new button")).toBe("low")
    })

    it("should classify medium complexity", () => {
      expect(estimateComplexity("implement the feature")).toBe("medium")
    })

    it("should classify high complexity", () => {
      expect(estimateComplexity("integrate with the payment system")).toBe("high")
    })

    it("should classify very-high complexity", () => {
      expect(estimateComplexity("rewrite the entire platform")).toBe("very-high")
    })

    it("should default to medium for unknown", () => {
      expect(estimateComplexity("do something")).toBe("medium")
    })
  })

  describe("extractKeywords", () => {
    it("should extract meaningful keywords", () => {
      const kw = extractKeywords("Build a responsive login form with validation")
      expect(kw).toContain("build")
      expect(kw).toContain("responsive")
      expect(kw).toContain("login")
      expect(kw).toContain("form")
      expect(kw).toContain("validation")
    })

    it("should filter stop words", () => {
      const kw = extractKeywords("the quick brown fox")
      expect(kw).not.toContain("the")
    })

    it("should deduplicate", () => {
      const kw = extractKeywords("build build build")
      expect(kw.filter((k) => k === "build")).toHaveLength(1)
    })
  })

  describe("containsHedging", () => {
    it("should detect hedging language", () => {
      expect(containsHedging("maybe add some tests")).toBe(true)
      expect(containsHedging("ideally it should be fast")).toBe(true)
      expect(containsHedging("it would be nice to have caching")).toBe(true)
      expect(containsHedging("if possible, add dark mode")).toBe(true)
    })

    it("should not flag direct statements", () => {
      expect(containsHedging("create a login form")).toBe(false)
      expect(containsHedging("implement authentication")).toBe(false)
    })
  })

  describe("computeConfidence", () => {
    it("should give primary intents higher base confidence", () => {
      const primary = computeConfidence("build a login form", "primary")
      const secondary = computeConfidence("build a login form", "secondary")
      const implicit = computeConfidence("build a login form", "implicit")
      expect(primary).toBeGreaterThan(secondary)
      expect(secondary).toBeGreaterThan(implicit)
    })

    it("should cap at 1.0", () => {
      const conf = computeConfidence("a very long description with many specific keywords for testing", "primary")
      expect(conf).toBeLessThanOrEqual(1.0)
    })
  })

  describe("createIntent", () => {
    it("should create a well-formed intent", () => {
      const intent = createIntent("Build a responsive dashboard", "primary")
      expect(intent.id).toBeTruthy()
      expect(intent.layer).toBe("primary")
      expect(intent.description).toBe("Build a responsive dashboard")
      expect(intent.confidence).toBeGreaterThan(0)
      expect(intent.keywords).toContain("build")
      expect(intent.complexity).toBeTruthy()
    })
  })
})

describe("IntentExtractor", () => {
  let extractor: IntentExtractor

  beforeEach(() => {
    extractor = new IntentExtractor()
  })

  describe("extract", () => {
    it("should extract primary intents from direct statements", () => {
      const result = extractor.extract("Build a login form with JWT authentication")
      expect(result.primary.length).toBeGreaterThanOrEqual(1)
      expect(result.primary[0].layer).toBe("primary")
    })

    it("should extract implicit intents from hedging language", () => {
      const result = extractor.extract(
        "Build a login form. Maybe add social login if possible. Implement JWT tokens.",
      )
      expect(result.implicit.length).toBeGreaterThanOrEqual(1)
      expect(result.implicit.some((i) => i.description.toLowerCase().includes("social login"))).toBe(true)
    })

    it("should derive secondary intents from primary intents", () => {
      const result = extractor.extract("Create a REST API endpoint for user management")
      // Should derive API-related secondary intents
      expect(result.secondary.length).toBeGreaterThanOrEqual(1)
    })

    it("should handle single-clause prompts", () => {
      const result = extractor.extract("Build a dashboard")
      expect(result.primary).toHaveLength(1)
      expect(result.primary[0].description).toBe("Build a dashboard")
    })

    it("should handle multi-line prompts with mixed intent layers", () => {
      const result = extractor.extract(
        "Create a user authentication system.\n" +
          "It needs to support OAuth2 and JWT.\n" +
          "Maybe add password reset functionality eventually.\n" +
          "Deploy to staging first.",
      )

      expect(result.primary.length).toBeGreaterThanOrEqual(1)
      expect(result.implicit.length).toBeGreaterThanOrEqual(1)
      const allLayers = [...result.primary, ...result.secondary, ...result.implicit]
      expect(allLayers.length).toBeGreaterThanOrEqual(3)
    })

    it("should ensure at least one primary intent", () => {
      const result = extractor.extract("something")
      expect(result.primary.length).toBeGreaterThanOrEqual(1)
    })
  })
})
