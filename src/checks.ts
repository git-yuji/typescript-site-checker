export type CheckStatus = "pass" | "warning" | "error";

export type CheckResult = {
  title: string;
  message: string;
  status: CheckStatus;
};

export const checkTitle = (htmlDocument: Document): CheckResult => {
  const title = htmlDocument.querySelector("title")?.textContent?.trim();

  if (!title) {
    return {
      title: "ページタイトル",
      message: "titleが設定されていません。",
      status: "error",
    };
  }

  return {
    title: "ページタイトル",
    message: `titleが設定されています: ${title}`,
    status: "pass",
  };
};

export const checkDescription = (htmlDocument: Document): CheckResult => {
  const description = htmlDocument
    .querySelector<HTMLMetaElement>('meta[name="description"]')
    ?.content.trim();

  if (!description) {
    return {
      title: "メタディスクリプション",
      message: "descriptionが設定されていません。",
      status: "warning",
    };
  }

  return {
    title: "メタディスクリプション",
    message: `descriptionが設定されています: ${description}`,
    status: "pass",
  };
};

export const checkH1 = (htmlDocument: Document): CheckResult => {
  const h1Count = htmlDocument.querySelectorAll("h1").length;

  if (h1Count === 0) {
    return {
      title: "見出し",
      message: "h1が設定されていません。",
      status: "error",
    };
  }

  if (h1Count > 1) {
    return {
      title: "見出し",
      message: `h1が${h1Count}個あります。`,
      status: "error",
    };
  }

  return {
    title: "見出し",
    message: "h1が1個設定されています。",
    status: "pass",
  };
};

export const checkOgp = (htmlDocument: Document): CheckResult => {
  const ogpProperties = [
    "og:title",
    "og:type",
    "og:image",
    "og:url",
    "og:description",
  ];

  const missingProperties = ogpProperties.filter((property) => {
    const content = htmlDocument
      .querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      ?.content.trim();

    return !content;
  });

  if (missingProperties.length > 0) {
    return {
      title: "OGP",
      message: `未設定のOGPがあります: ${missingProperties.join(", ")}`,
      status: "warning",
    };
  }

  return {
    title: "OGP",
    message: "主要なOGPが設定されています。",
    status: "pass",
  };
};

export const checkCanonical = (htmlDocument: Document): CheckResult => {
  const canonicalUrl = htmlDocument
    .querySelector<HTMLLinkElement>(`link[rel="canonical"]`)
    ?.getAttribute("href")
    ?.trim();

  if (!canonicalUrl) {
    return {
      title: "canonical URL",
      message: "canonical URLが設定されていません。",
      status: "warning",
    };
  }

  return {
    title: "canonical URL",
    message: `canonical URLが設定されています: ${canonicalUrl}`,
    status: "pass",
  };
};

export const checkFavicon = (htmlDocument: Document): CheckResult => {
  const faviconUrl = htmlDocument
    .querySelector<HTMLLinkElement>(`link[rel~="icon"]`)
    ?.getAttribute("href")
    ?.trim();

  if (!faviconUrl) {
    return {
      title: "favicon",
      message: "faviconが設定されていません。",
      status: "warning",
    };
  }

  return {
    title: "favicon",
    message: `faviconが設定されています: ${faviconUrl}`,
    status: "pass",
  };
};

export const checkRobots = (htmlDocument: Document): CheckResult => {
  const robotsContent = htmlDocument
    .querySelector<HTMLMetaElement>(`meta[name="robots"]`)
    ?.content.trim()
    .toLowerCase();

  if (!robotsContent) {
    return {
      title: "robots",
      message: "robots設定がありません。",
      status: "warning",
    };
  }

  const directives = robotsContent.split(/[,\s]+/);
  const blockedDirectives = directives.filter(
    (directive) => directive === "noindex" || directive === "nofollow",
  );

  if (blockedDirectives.length > 0) {
    return {
      title: "robots",
      message: `公開を制限する設定があります: ${blockedDirectives.join(", ")}`,
      status: "error",
    };
  }

  return {
    title: "robots",
    message: `robotsが設定されています: ${robotsContent}`,
    status: "pass",
  };
};

export const checkImageAlt = (htmlDocument: Document): CheckResult => {
  const imageCount = htmlDocument.querySelectorAll("img").length;
  const missingAltCount =
    htmlDocument.querySelectorAll("img:not([alt])").length;

  if (imageCount === 0) {
    return {
      title: "画像のalt属性",
      message: "画像はありません。",
      status: "pass",
    };
  }

  if (missingAltCount > 0) {
    return {
      title: "画像のalt属性",
      message: `${imageCount}枚中${missingAltCount}枚にalt属性がありません。`,
      status: "error",
    };
  }

  return {
    title: "画像のalt属性",
    message: `${imageCount}枚すべてにalt属性があります。`,
    status: "pass",
  };
};

export const runChecks = (htmlDocument: Document): CheckResult[] => [
  checkTitle(htmlDocument),
  checkDescription(htmlDocument),
  checkH1(htmlDocument),
  checkOgp(htmlDocument),
  checkCanonical(htmlDocument),
  checkFavicon(htmlDocument),
  checkRobots(htmlDocument),
  checkImageAlt(htmlDocument),
];
