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
  </main>
`;

