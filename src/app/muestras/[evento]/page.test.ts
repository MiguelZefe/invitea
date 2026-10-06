import { expect, it } from "vitest";
import { generateStaticParams } from "./page";

it("prebuilds a sample route for each of the six exploratory event categories", () => {
  expect(generateStaticParams().map(({ evento }) => evento)).toEqual([
    "baby-shower",
    "boda",
    "xv-anos",
    "primera-comunion",
    "graduacion",
    "aniversario",
  ]);
});
