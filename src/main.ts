import "./style.css";
import { runChecks } from "./checks";
import type { CheckResult, CheckStatus } from "./checks";

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
