import { expect, it } from "vitest";
import { createAlbumItemId } from "./album-item-id";

it("keeps separately selected copies of the same file as distinct album items", () => {
  const first = createAlbumItemId("sample.jpg", 1_800_000_000_000, 1024);
  const selectedAgain = createAlbumItemId("sample.jpg", 1_800_000_000_000, 1024);

  expect(selectedAgain).not.toBe(first);
});
