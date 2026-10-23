import test from "node:test";
import assert from "node:assert/strict";
import { instagramUrl, accountName, selectReels } from "../src/domain.js";
import { initialReels } from "../src/data.js";

test("Instagram URLs are canonicalized and tracking parameters removed", () => {
  assert.equal(
    instagramUrl("https://instagram.com/reel/AbC_123-/?igsh=tracking"),
    "https://www.instagram.com/reel/AbC_123-/",
  );
  assert.equal(
    instagramUrl("https://www.instagram.com/p/AbC123/"),
    "https://www.instagram.com/reel/AbC123/",
  );
});
test("non-Instagram and non-video links cannot become references", () => {
  for (const url of [
    "javascript:alert(1)",
    "https://instagram.com.evil.org/reel/abc/",
    "http://instagram.com/reel/abc/",
    "https://instagram.com/author/",
    "invalid",
  ])
    assert.equal(instagramUrl(url), null);
});
test("handles are parsed without allowing arbitrary destinations or scripts", () => {
  assert.equal(accountName("@tikatheiggy"), "tikatheiggy");
  assert.equal(
    accountName("https://www.instagram.com/boobie_billie/"),
    "boobie_billie",
  );
  assert.equal(accountName("<script>"), null);
  assert.equal(accountName("https://evil.org/name"), null);
});
test("ranking prioritizes editorial scores and preserves input", () => {
  const source = [
    { id: "a", score: 40, created: 20 },
    { id: "b", score: 95, created: 10 },
  ];
  assert.deepEqual(
    selectReels(source).map((r) => r.id),
    ["b", "a"],
  );
  assert.deepEqual(
    source.map((r) => r.id),
    ["a", "b"],
  );
  assert.deepEqual(
    selectReels(source, { sort: "recent" }).map((r) => r.id),
    ["a", "b"],
  );
});
test("search, theme, overseas filter and favorites compose correctly", () => {
  assert.deepEqual(
    selectReels(initialReels, {
      query: "prada",
      region: "world",
      category: "Переодевашки",
      savedOnly: true,
      saved: ["prada"],
    }).map((r) => r.id),
    ["prada"],
  );
  assert.equal(
    selectReels(initialReels, { query: "prada", region: "local" }).length,
    0,
  );
  assert.equal(selectReels(initialReels, { savedOnly: true }).length, 0);
});
