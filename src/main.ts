import "./style.css";

type CheckStatus = "pass" | "warning" | "error";

type CheckResult = {
  title: string;
  message: string;
  status: CheckStatus;
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

const runChecks = (htmlDocument: Document): CheckResult[] => [
  checkTitle(htmlDocument),
  checkDescription(htmlDocument),
  checkH1(htmlDocument),
];

const sampleResults = runChecks(sampleDocument);

const resultListHtml = sampleResults
  .map(
    (result) => `
      <li class="result-card result-card--${result.status}">
        <h3>${result.title}</h3>
        <p>${result.message}</p>
        <span>${result.status}</span>
      </li>
    `,
  )
  .join("");

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

      <button type="submit">チェックする</button>
      <p id="url-error" aria-live="polite" hidden></p>
    </form>

    <section class="results" aria-labelledby="results-heading">
      <h2 id="results-heading">診断結果</h2>
      <ul class="result-list">
        ${resultListHtml}
      </ul>
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

const handleSubmit = (event: SubmitEvent): void => {
  event.preventDefault();

  const inputValue = urlInput.value;
  const errorMessage = validateUrl(inputValue);

  displayError(errorMessage);

  if (errorMessage !== null) {
    console.log(errorMessage);
    return;
  }

  console.log("入力されたURL:", inputValue);
};

urlForm.addEventListener("submit", handleSubmit);
