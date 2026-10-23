import assert from "node:assert/strict";
import test from "node:test";

import { assessments, getAssessment, sourceById, sources } from "../lib/assessments.ts";
import { validateAssessment, validateResearchData } from "../lib/assessment-rules.ts";

function assessmentFor(id: string) {
  const assessment = getAssessment(id);
  assert.ok(assessment, `Expected research assessment ${id}`);
  return assessment;
}

void test("the three research assessments satisfy the data contract", () => {
  assert.equal(assessments.length, 3);
  assert.equal(new Set(assessments.map((assessment) => assessment.id)).size, 3);
  assert.deepEqual(validateResearchData(), []);
  for (const assessment of assessments) {
    assert.deepEqual(validateAssessment(assessment), [], assessment.id);
    assert.equal(getAssessment(assessment.id), assessment);
  }
  assert.equal(getAssessment("not-an-assessed-position"), undefined);
});

void test("NO_RATE records never expose unsupported approved or indicated results", () => {
  for (const assessment of assessments) {
    assert.equal(assessment.disposition, "NO_RATE", assessment.id);
    assert.equal(assessment.approvedScore, null, assessment.id);
    assert.equal(assessment.approvedGrade, null, assessment.id);
    assert.equal(assessment.approvedConfidence, null, assessment.id);
    assert.equal(assessment.indicatedScore, null, assessment.id);
    assert.equal(assessment.indicatedGrade, null, assessment.id);
  }
});

void test("position identities preserve the researched publisher September series", () => {
  const spot = assessmentFor("onyc");
  const pt = assessmentFor("pt-onyc");
  const senior = assessmentFor("pt-sronyc");

  assert.equal(spot.mint, "5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5");
  assert.equal(spot.market, null);
  assert.equal(spot.maturity, null);

  assert.equal(pt.mint, "2W5zZccVq8AMdrg7P4b3NvBKJyzbdnytRy2CKEDHvhiJ");
  assert.equal(pt.market, "66R3TcKjaUqxQwYV31BS4nD2s7YH4V7ENuvdwYbQMXCm");
  assert.equal(Date.parse(pt.maturity!), Date.parse("2026-09-10T09:58:19Z"));

  assert.equal(senior.mint, "BKP9Rt3pwh96cCoCp3bkh1zxXZpZez17xA6w64LuMJQy");
  assert.equal(senior.market, "FLWUHWccnouW4EkB4dgczX9ZkSTA4FTnADiKSCkJvLp5");
  assert.equal(Date.parse(senior.maturity!), Date.parse("2026-09-10T09:58:00Z"));
  assert.equal(Date.parse(pt.maturity!) - Date.parse(senior.maturity!), 19_000);
  assert.equal(new Set(assessments.map((assessment) => assessment.mint)).size, 3);

  for (const assessment of [pt, senior]) {
    assert.ok(
      assessment.scopeAssumptions.some(
        (assumption) => /maturity|series/i.test(assumption) && /assumption/i.test(assumption),
      ),
      `${assessment.id}: the selected PT series must be an explicit assumption`,
    );
  }
});

void test("material source references resolve to an identifiable source", () => {
  assert.equal(new Set(sources.map((source) => source.id)).size, sources.length);
  for (const assessment of assessments) {
    assert.ok(assessment.sourceIds.length > 0, assessment.id);
    for (const sourceId of assessment.sourceIds) {
      assert.ok(sourceById(sourceId), `${assessment.id}: ${sourceId}`);
    }
    const claims = [
      ...assessment.factors,
      ...assessment.evidence,
      ...assessment.layers,
      ...assessment.routes.flatMap((route) => route.steps),
    ];
    for (const claim of claims) {
      assert.ok(claim.sourceIds.length > 0, `${assessment.id}: an unsupported claim`);
      for (const sourceId of claim.sourceIds) {
        assert.ok(sourceById(sourceId), `${assessment.id}: ${sourceId}`);
        assert.ok(assessment.sourceIds.includes(sourceId), `${assessment.id}: undeclared ${sourceId}`);
      }
    }
  }
  assert.equal(sourceById("missing-evidence-source"), undefined);
});

void test("validation rejects an approved score attached to NO_RATE", () => {
  const assessment = structuredClone(assessments[0]);
  Object.assign(assessment, { approvedScore: 0.5 });
  assert.ok(validateAssessment(assessment).length > 0);
});

void test("unsupported grades, confidence and negative or nonfinite scores cannot enter the research view", () => {
  const corruptions = [
    { approvedGrade: "BBB" },
    { approvedConfidence: "High" },
    { indicatedGrade: "A" },
    { indicatedScore: -0.25 },
    { approvedScore: -1 },
    { indicatedScore: Number.NaN },
    { approvedScore: Number.POSITIVE_INFINITY },
    { disposition: "APPROVED" },
  ];
  for (const corruption of corruptions) {
    const assessment = structuredClone(assessments[0]);
    Object.assign(assessment, corruption);
    assert.ok(validateAssessment(assessment).length > 0, Object.keys(corruption).join(", "));
  }
});

void test("validation rejects an invented material evidence reference", () => {
  const assessment = structuredClone(assessments[0]);
  assessment.sourceIds.push("fabricated-evidence-source");
  assert.ok(validateAssessment(assessment).length > 0);
});

void test("validation checks evidence references inside factors, routes and dependencies", () => {
  const corruptions = ["factor", "evidence", "layer", "route"] as const;
  for (const kind of corruptions) {
    const assessment = structuredClone(assessmentFor("pt-sronyc"));
    const claim = kind === "factor" ? assessment.factors[0]
      : kind === "evidence" ? assessment.evidence[0]
      : kind === "layer" ? assessment.layers[0]
      : assessment.routes[0].steps[0];
    claim.sourceIds = ["fabricated-nested-source"];
    assert.ok(validateAssessment(assessment).length > 0, kind);
  }
});

void test("every dependency graph is connected to its held position without cycles", () => {
  for (const assessment of assessments) {
    const roots = assessment.layers.filter((layer) => layer.role === "held");
    assert.equal(roots.length, 1, assessment.id);
    const byId = new Map(assessment.layers.map((layer) => [layer.id, layer]));
    assert.equal(byId.size, assessment.layers.length, assessment.id);
    for (const layer of assessment.layers) {
      const path = new Set<string>();
      let cursor = layer;
      while (cursor.id !== roots[0].id) {
        assert.ok(!path.has(cursor.id), `${assessment.id}: cycle at ${cursor.id}`);
        path.add(cursor.id);
        assert.ok(cursor.parentId, `${assessment.id}: detached ${cursor.id}`);
        const parent = byId.get(cursor.parentId);
        assert.ok(parent, `${assessment.id}: missing parent ${cursor.parentId}`);
        cursor = parent;
      }
    }
  }
});

void test("the senior position retains ONyc inheritance and treats junior capital as protection", () => {
  const senior = assessmentFor("pt-sronyc");
  const junior = senior.layers.find((layer) => layer.id === "junior");
  const onyc = senior.layers.find((layer) => layer.id === "onyc-token");
  assert.ok(junior);
  assert.equal(junior.role, "S");
  assert.equal(junior.parentId, "senior");
  assert.ok(onyc);
  assert.equal(onyc.role, "D");
  assert.equal(onyc.parentId, "senior");

  const corrupted = structuredClone(senior);
  corrupted.layers.find((layer) => layer.id === "junior")!.role = "D";
  assert.ok(validateAssessment(corrupted).length > 0);
});

void test("validation rejects a dependency cycle even when every parent exists", () => {
  const assessment = structuredClone(assessmentFor("pt-onyc"));
  assessment.layers.find((layer) => layer.id === "reinsurance")!.parentId = "collateral";
  assessment.layers.find((layer) => layer.id === "collateral")!.parentId = "reinsurance";
  assert.ok(validateAssessment(assessment).some((error) => /cycle/i.test(error)));
});

void test("PT maturity must retain a valid exact timestamp, including its calendar date", () => {
  for (const maturity of [null, "", "not-a-timestamp", "2026-09-10", "2026-02-31T09:58:19Z"]) {
    const assessment = structuredClone(assessmentFor("pt-onyc"));
    assessment.maturity = maturity;
    assert.ok(validateAssessment(assessment).length > 0, `Accepted invalid PT maturity ${maturity}`);
  }

  const spot = structuredClone(assessmentFor("onyc"));
  spot.maturity = "2026-09-10T09:58:19Z";
  assert.ok(validateAssessment(spot).length > 0);
});

void test("valid-format addresses from a different PT series cannot replace the assessed position", () => {
  const corruptions = [
    { mint: "HH7FiYbEfDwQoK2ZJpkMz1T6wG6TqPsWcxWCtEVgigrZ" },
    { market: "7f1PgxY3kGsPqLAKpwcduZkcBEhpjMz7U1iJ4pcCCzDy" },
    { maturity: "2027-01-10T13:00:00Z" },
  ];
  for (const corruption of corruptions) {
    const assessment = structuredClone(assessmentFor("pt-onyc"));
    Object.assign(assessment, corruption);
    assert.ok(validateAssessment(assessment).length > 0, Object.keys(corruption).join(", "));
  }
});

void test("a malformed route step is reported as a validation error", () => {
  const assessment = structuredClone(assessmentFor("pt-sronyc"));
  Object.assign(assessment.routes[0], { steps: [null] });
  assert.doesNotThrow(() => validateAssessment(assessment));
  assert.ok(validateAssessment(assessment).length > 0);
});
