import "./style.css";

type CheckStatus = "pass" | "warning" | "error";

type CheckResult = {
  title: string;
  message: string;
  status: CheckStatus;
};

type ResultCounts = Record<CheckStatus, number>;

type FetchSiteResponse =
  | {
      html: string;
    }
  | {
      error: string;
    };

const sampleHtml = `
  <!doctype html>
  <html lang="ja">
    <head>
      <title>サンプルサイト</title>
      <meta name="description" content="サンプルサイトの説明です。">
    </head>
    <body>
      <h1>サンプルサイト</h1>
    </body>
  </html>
`;

const sampleDocument = new DOMParser().parseFromString(sampleHtml, "text/html");

const checkTitle = (htmlDocument: Document): CheckResult => {
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

const checkDescription = (htmlDocument: Document): CheckResult => {
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

const checkH1 = (htmlDocument: Document): CheckResult => {
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

const checkOgp = (htmlDocument: Document): CheckResult => {
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

const checkCanonical = (htmlDocument: Document): CheckResult => {
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

const checkFavicon = (htmlDocument: Document): CheckResult => {
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

const checkRobots = (htmlDocument: Document): CheckResult => {
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

const checkImageAlt = (htmlDocument: Document): CheckResult => {
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

const runChecks = (htmlDocument: Document): CheckResult[] => [
  checkTitle(htmlDocument),
  checkDescription(htmlDocument),
  checkH1(htmlDocument),
  checkOgp(htmlDocument),
  checkCanonical(htmlDocument),
  checkFavicon(htmlDocument),
  checkRobots(htmlDocument),
  checkImageAlt(htmlDocument),
];

const sampleResults = runChecks(sampleDocument);

const app = document.querySelector<HTMLDivElement>("#app");

if (app === null) {
  throw new Error("#app が見つかりません。");
}

app.innerHTML = `
  <main class="app">
    <p class="eyebrow">TYPESCRIPT LEARNING</p>
    <h1>Webサイト公開前チェッカー</h1>
    <p>ここから、ひとつずつチェック機能を作っていきます。</p>

    <form id="url-form">
      <label for="url-input">WebサイトのURL</label>

      <input
        type="text"
        id="url-input"
        name="url"
        placeholder="https://example.com"
        aria-describedby="url-error"
      >

      <button type="submit" id="check-button">チェックする</button>
      <p id="url-error" aria-live="polite" hidden></p>
    </form>

    <section class="results" aria-labelledby="results-heading">
      <h2 id="results-heading">診断結果</h2>
      <div
        id="result-summary"
        class="result-summary"
        aria-live="polite"
        tabindex="-1"
      ></div>
      <ul id="result-list" class="result-list"></ul>
    </section>
  </main>
`;

const urlForm = document.querySelector<HTMLFormElement>("#url-form");

if (urlForm === null) {
  throw new Error("#url-form が見つかりません。");
}

const urlInput = document.querySelector<HTMLInputElement>("#url-input");

if (urlInput === null) {
  throw new Error("#url-input が見つかりません。");
}

const urlError = document.querySelector<HTMLParagraphElement>("#url-error");

if (urlError === null) {
  throw new Error("#url-error が見つかりません。");
}

const validateUrl = (value: string): string | null => {
  if (value.trim() === "") {
    return "URLを入力してください。";
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "httpまたはhttpsのURLを入力してください。";
    }
  } catch {
    return "正しい形式のURLを入力してください。";
  }

  return null;
};

const resultList = document.querySelector<HTMLUListElement>("#result-list");

if (resultList === null) {
  throw new Error("#result-list が見つかりません。");
}

const resultSummary = document.querySelector<HTMLDivElement>("#result-summary");

if (resultSummary === null) {
  throw new Error("#result-summary が見つかりません。");
}

const checkButton = document.querySelector<HTMLButtonElement>("#check-button");
if (checkButton === null) {
  throw new Error("#check-button が見つかりません。");
}

let hasCompletedChecks = false;

const fetchSiteHtml = async (url: string): Promise<string> => {
  const response = await fetch("/api/fetch-site", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  const data = (await response.json()) as FetchSiteResponse;

  if ("error" in data) {
    throw new Error(data.error);
  }

  if (!response.ok) {
    throw new Error("HTMLを取得できませんでした。");
  }

  return data.html;
};

const displayError = (message: string | null): void => {
  if (message === null) {
    urlError.textContent = "";
    urlError.hidden = true;
    urlInput.setAttribute("aria-invalid", "false");
    return;
  }

  urlError.textContent = message;
  urlError.hidden = false;
  urlInput.setAttribute("aria-invalid", "true");
};

const setLoading = (isLoading: boolean): void => {
  checkButton.disabled = isLoading;
  urlForm.setAttribute("aria-busy", String(isLoading));

  if (isLoading) {
    checkButton.textContent = "チェック中...";
    return;
  }

  checkButton.textContent = hasCompletedChecks ? "再チェック" : "チェックする";
};

const createResultCard = (result: CheckResult): HTMLLIElement => {
  const card = document.createElement("li");
  const title = document.createElement("h3");
  const message = document.createElement("p");
  const status = document.createElement("span");

  card.className = `result-card result-card--${result.status}`;
  title.textContent = result.title;
  message.textContent = result.message;
  status.textContent = result.status;

  card.append(title, message, status);
  return card;
};

const statusPriority: Record<CheckStatus, number> = {
  error: 0,
  warning: 1,
  pass: 2,
};

const sortResults = (results: CheckResult[]): CheckResult[] => {
  return [...results].sort(
    (firstResult, secondResult) =>
      statusPriority[firstResult.status] - statusPriority[secondResult.status],
  );
};

const countResults = (results: CheckResult[]): ResultCounts => {
  return results.reduce<ResultCounts>(
    (counts, result) => {
      counts[result.status] += 1;
      return counts;
    },
    {
      pass: 0,
      warning: 0,
      error: 0,
    },
  );
};

const displaySummary = (counts: ResultCounts): void => {
  resultSummary.textContent =
    `エラー ${counts.error}件・` +
    `警告 ${counts.warning}件・` +
    `合格 ${counts.pass}件`;
};

const displayResults = (results: CheckResult[]): void => {
  const counts = countResults(results);
  const sortedResults = sortResults(results);
  const cards = sortedResults.map(createResultCard);

  displaySummary(counts);
  resultList.replaceChildren(...cards);
};

displayResults(sampleResults);

const handleSubmit = async (event: SubmitEvent): Promise<void> => {
  event.preventDefault();

  const inputValue = urlInput.value;
  const errorMessage = validateUrl(inputValue);

  displayError(errorMessage);

  if (errorMessage !== null) {
    return;
  }

  setLoading(true);

  try {
    const html = await fetchSiteHtml(inputValue.trim());
    const htmlDocument = new DOMParser().parseFromString(html, "text/html");

    const results = runChecks(htmlDocument);
    displayResults(results);
    resultSummary.focus();

    hasCompletedChecks = true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "HTMLを取得できませんでした。";

    displayError(message);
  } finally {
    setLoading(false);
  }
};

urlForm.addEventListener("submit", handleSubmit);
