import { escapeHtml, toJsonForScript } from '../lib/utils/html.js';

describe("html utils", () => {
  describe("escapeHtml", () => {
    it("escapes all dangerous entities", () => {
      expect(escapeHtml(`<a href="x" class='y'>&`)).toBe("&lt;a href=&quot;x&quot; class=&#39;y&#39;&gt;&amp;");
    });

    it("handles non-strings and nullish values", () => {
      expect(escapeHtml(5)).toBe("5");
      expect(escapeHtml(null)).toBe("");
      expect(escapeHtml(undefined)).toBe("");
    });
  });

  describe("toJsonForScript", () => {
    it("escapes </script> breakouts", () => {
      const out = toJsonForScript({ evil: "</script><script>alert(1)</script>" });
      expect(out).not.toContain("</script");
      expect(JSON.parse(out.replace(/\\u003c/g, "<"))).toEqual({
        evil: "</script><script>alert(1)</script>",
      });
    });

    it("escapes line separator characters invalid in JS string literals", () => {
      const sep = String.fromCharCode(0x2028);
      const psep = String.fromCharCode(0x2029);
      const out = toJsonForScript({ s: `a${sep}b${psep}c` });
      expect(out).not.toContain(sep);
      expect(out).not.toContain(psep);
    });

    it("round-trips plain data", () => {
      const data = { a: [1, "two", { b: true }], c: null };
      expect(JSON.parse(toJsonForScript(data))).toEqual(data);
    });
  });
});
