import { chooseSmallestImage, Image } from "../../model/spotifyApi";

describe("chooseSmallestImage", () => {
  test("it should find smallest image", async () => {
    const images: Image[] = [
      {
        url: 'tooSmall',
        width: 32,
        height: 32,
      },
      {
        url: 'smallestAboveMinSize',
        width: 64,
        height: 64,
      },
      {
        url: 'tooLarge',
        width: 100,
        height: 100,
      }
    ];
    const result = chooseSmallestImage(images, 56);
    expect(result).toEqual('smallestAboveMinSize');
  });

  test("too small image return none", async () => {
    const images: Image[] = [
      {
        url: 'tooSmall1',
        width: 32,
        height: 32,
      },
      {
        url: 'tooSmall2',
        width: 48,
        height: 48,
      },
      {
        url: 'tooSmall3',
        width: 55,
        height: 55,
      }
    ];
    const result = chooseSmallestImage(images, 56);
    expect(result).toEqual('');
  });

  test("one image should return same image", async () => {
    const images: Image[] = [
      {
        url: 'oneimage',
        width: 64,
        height: 64,
      }
    ];
    const result = chooseSmallestImage(images, 56);
    expect(result).toEqual('oneimage');
  });

  test("empty array should return empty string", async () => {
    const images: Image[] = [];
    const result = chooseSmallestImage(images, 56);
    expect(result).toBe('');
  });
});
