import "./style.css";

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
