import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it, vi } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "@/proxy";

vi.mock("@/lib/supabase-proxy", () => ({ updateSupabaseSession: () => { throw new Error("Remote session prohibited"); } }));

it.each(["/laboratorio-comercial", "/laboratorio-comercial?_rsc=demo"])("does not invoke the session proxy for %s", url => {
  expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(false);
});

it("keeps the entire lab import graph within the lab and framework", () => {
  const allowed = new Set([
    "react", "next/navigation", "./CommercialLab",
    "@/lib/commercial-lab/contract", "@/lib/commercial-lab/draft",
  ]);
  for (const directory of ["src/app/laboratorio-comercial", "src/lib/commercial-lab"]) {
    for (const file of readdirSync(resolve(directory)).filter(name => /\.tsx?$/.test(name) && !name.endsWith(".test.ts"))) {
      const source = readFileSync(resolve(directory, file), "utf8");
      const imports = [...source.matchAll(/(?:from\s+|import\s*\()(["'])([^"']+)\1/g)].map(match => match[2]);
      for (const dependency of imports) expect(allowed.has(dependency), `${file}: ${dependency}`).toBe(true);
      expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(|["']use server["']/);
    }
  }
});
