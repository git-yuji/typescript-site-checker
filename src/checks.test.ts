// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  checkCanonical,
  checkDescription,
  checkFavicon,
  checkH1,
  checkImageAlt,
  checkOgp,
  checkRobots,
  checkTitle,
  runChecks,
} from "./checks";

const parseHtml = (html: string): Document => {
  return new DOMParser().parseFromString(html, "text/html");
};

describe("checkTitle", () => {
  it("titleが設定されている場合はpassを返す", () => {
    const htmlDocument = parseHtml(`
        <html>
          <head>
            <title>テストサイト</title>
          </head>
        </html>
      `);

    expect(checkTitle(htmlDocument)).toEqual({
      title: "ページタイトル",
      message: "titleが設定されています: テストサイト",
      status: "pass",
    });
  });

  it("titleがない場合はerrorを返す", () => {
    const htmlDocument = parseHtml(`
        <html>
          <head></head>
        </html>
      `);

    expect(checkTitle(htmlDocument)).toEqual({
      title: "ページタイトル",
      message: "titleが設定されていません。",
      status: "error",
    });
  });
});

describe("checkDescription", () => {
  it("descriptionが設定されている場合はpassを返す", () => {
    const htmlDocument = parseHtml(`
        <html>
          <head>
            <meta
              name="description"
              content="テストサイトの説明"
            >
          </head>
        </html>
      `);

    expect(checkDescription(htmlDocument)).toEqual({
      title: "メタディスクリプション",
      message: "descriptionが設定されています: テストサイトの説明",
      status: "pass",
    });
  });

  it("descriptionがない場合はwarningを返す", () => {
    const htmlDocument = parseHtml(`
        <html>
          <head></head>
        </html>
      `);

    expect(checkDescription(htmlDocument)).toEqual({
      title: "メタディスクリプション",
      message: "descriptionが設定されていません。",
      status: "warning",
    });
  });
});

describe("checkH1", () => {
  it("h1が1個の場合はpassを返す", () => {
    const htmlDocument = parseHtml(`
      <body>
        <h1>ページ見出し</h1>
      </body>
    `);

    expect(checkH1(htmlDocument)).toEqual({
      title: "見出し",
      message: "h1が1個設定されています。",
      status: "pass",
    });
  });

  it("h1がない場合はerrorを返す", () => {
    const htmlDocument = parseHtml(`
      <body>
        <p>本文</p>
      </body>
    `);

    expect(checkH1(htmlDocument)).toEqual({
      title: "見出し",
      message: "h1が設定されていません。",
      status: "error",
    });
  });

  it("h1が複数ある場合はerrorを返す", () => {
    const htmlDocument = parseHtml(`
      <body>
        <h1>見出し1</h1>
        <h1>見出し2</h1>
      </body>
    `);

    expect(checkH1(htmlDocument)).toEqual({
      title: "見出し",
      message: "h1が2個あります。",
      status: "error",
    });
  });
});

describe("checkOgp", () => {
  it("主要なOGPがすべて設定されている場合はpassを返す", () => {
    const htmlDocument = parseHtml(`
      <head>
        <meta property="og:title" content="テストサイト">
        <meta property="og:type" content="website">
        <meta property="og:image" content="https://example.com/image.jpg">
        <meta property="og:url" content="https://example.com/">
        <meta property="og:description" content="テストサイトの説明">
      </head>
    `);

    expect(checkOgp(htmlDocument)).toEqual({
      title: "OGP",
      message: "主要なOGPが設定されています。",
      status: "pass",
    });
  });

  it("未設定または空のOGPがある場合はwarningを返す", () => {
    const htmlDocument = parseHtml(`
      <head>
        <meta property="og:title" content="テストサイト">
        <meta property="og:type" content="website">
        <meta property="og:image" content="">
        <meta property="og:description" content="テストサイトの説明">
      </head>
    `);

    expect(checkOgp(htmlDocument)).toEqual({
      title: "OGP",
      message: "未設定のOGPがあります: og:image, og:url",
      status: "warning",
    });
  });
});

describe("checkCanonical", () => {
  it("canonical URLが設定されている場合はpassを返す", () => {
    const htmlDocument = parseHtml(`
      <head>
        <link rel="canonical" href="https://example.com/page">
      </head>
    `);

    expect(checkCanonical(htmlDocument)).toEqual({
      title: "canonical URL",
      message: "canonical URLが設定されています: https://example.com/page",
      status: "pass",
    });
  });

  it("canonical URLが空の場合はwarningを返す", () => {
    const htmlDocument = parseHtml(`
      <head>
        <link rel="canonical" href="">
      </head>
    `);

    expect(checkCanonical(htmlDocument)).toEqual({
      title: "canonical URL",
      message: "canonical URLが設定されていません。",
      status: "warning",
    });
  });
});

describe("checkFavicon", () => {
  it("faviconが設定されている場合はpassを返す", () => {
    const htmlDocument = parseHtml(`
      <head>
        <link rel="shortcut icon" href="/favicon.ico">
      </head>
    `);

    expect(checkFavicon(htmlDocument)).toEqual({
      title: "favicon",
      message: "faviconが設定されています: /favicon.ico",
      status: "pass",
    });
  });

  it("faviconがない場合はwarningを返す", () => {
    const htmlDocument = parseHtml(`
      <head></head>
    `);

    expect(checkFavicon(htmlDocument)).toEqual({
      title: "favicon",
      message: "faviconが設定されていません。",
      status: "warning",
    });
  });
});

describe("checkRobots", () => {
  it("indexとfollowが設定されている場合はpassを返す", () => {
    const htmlDocument = parseHtml(`
      <head>
        <meta name="robots" content="index, follow">
      </head>
    `);

    expect(checkRobots(htmlDocument)).toEqual({
      title: "robots",
      message: "robotsが設定されています: index, follow",
      status: "pass",
    });
  });

  it("robots設定がない場合はwarningを返す", () => {
    const htmlDocument = parseHtml(`
      <head></head>
    `);

    expect(checkRobots(htmlDocument)).toEqual({
      title: "robots",
      message: "robots設定がありません。",
      status: "warning",
    });
  });

  it("noindexまたはnofollowがある場合はerrorを返す", () => {
    const htmlDocument = parseHtml(`
      <head>
        <meta name="robots" content="noindex, nofollow">
      </head>
    `);

    expect(checkRobots(htmlDocument)).toEqual({
      title: "robots",
      message: "公開を制限する設定があります: noindex, nofollow",
      status: "error",
    });
  });
});

describe("checkImageAlt", () => {
  it("画像がない場合はpassを返す", () => {
    const htmlDocument = parseHtml(`
      <body>
        <p>本文</p>
      </body>
    `);

    expect(checkImageAlt(htmlDocument)).toEqual({
      title: "画像のalt属性",
      message: "画像はありません。",
      status: "pass",
    });
  });

  it("すべての画像にalt属性がある場合はpassを返す", () => {
    const htmlDocument = parseHtml(`
      <body>
        <img src="photo.jpg" alt="風景写真">
        <img src="decoration.png" alt="">
      </body>
    `);

    expect(checkImageAlt(htmlDocument)).toEqual({
      title: "画像のalt属性",
      message: "2枚すべてにalt属性があります。",
      status: "pass",
    });
  });

  it("alt属性がない画像がある場合はerrorを返す", () => {
    const htmlDocument = parseHtml(`
      <body>
        <img src="with-alt.jpg" alt="説明あり">
        <img src="without-alt.jpg">
      </body>
    `);

    expect(checkImageAlt(htmlDocument)).toEqual({
      title: "画像のalt属性",
      message: "2枚中1枚にalt属性がありません。",
      status: "error",
    });
  });
});

describe("runChecks", () => {
  it("すべての診断を実行して正常な結果を返す", () => {
    const htmlDocument = parseHtml(`
      <html>
        <head>
          <title>テストサイト</title>
          <meta name="description" content="テストサイトの説明">
          <meta property="og:title" content="テストサイト">
          <meta property="og:type" content="website">
          <meta property="og:image" content="https://example.com/image.jpg">
          <meta property="og:url" content="https://example.com/">
          <meta property="og:description" content="テストサイトの説明">
          <link rel="canonical" href="https://example.com/">
          <link rel="icon" href="/favicon.ico">
          <meta name="robots" content="index, follow">
        </head>
        <body>
          <h1>テストサイト</h1>
          <img src="photo.jpg" alt="テスト画像">
        </body>
      </html>
    `);

    const results = runChecks(htmlDocument);

    expect(results.map((result) => result.title)).toEqual([
      "ページタイトル",
      "メタディスクリプション",
      "見出し",
      "OGP",
      "canonical URL",
      "favicon",
      "robots",
      "画像のalt属性",
    ]);
    expect(results.every((result) => result.status === "pass")).toBe(true);
  });
});
