import { defineConfig, type Plugin } from "vite";

const MAX_REQUEST_BODY_SIZE = 10_000;
const FETCH_TIMEOUT_MS = 10_000;

type FetchSiteRequest = {
  url?: unknown;
};

type FetchSiteResponse =
  | { html: string }
  | { error: string };

const siteFetchApi = (): Plugin => ({
  name: "site-fetch-api",
  configureServer(server) {
    server.middlewares.use("/api/fetch-site", async (request, response) => {
      const sendJson = (statusCode: number, data: FetchSiteResponse): void => {
        response.statusCode = statusCode;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(data));
      };

      if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        sendJson(405, { error: "POSTメソッドを使用してください。" });
        return;
      }

      try {
        request.setEncoding("utf8");

        let requestBody = "";

        for await (const chunk of request) {
          requestBody += chunk;

          if (requestBody.length > MAX_REQUEST_BODY_SIZE) {
            sendJson(413, { error: "リクエストが大きすぎます。" });
            return;
          }
        }

        let requestData: FetchSiteRequest;

        try {
          requestData = JSON.parse(requestBody) as FetchSiteRequest;
        } catch {
          sendJson(400, { error: "正しいJSONを送信してください。" });
          return;
        }

        if (typeof requestData.url !== "string") {
          sendJson(400, { error: "URLを指定してください。" });
          return;
        }

        let targetUrl: URL;

        try {
          targetUrl = new URL(requestData.url);
        } catch {
          sendJson(400, { error: "正しい形式のURLを指定してください。" });
          return;
        }

        if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
          sendJson(400, { error: "httpまたはhttpsのURLを指定してください。" });
          return;
        }

        const siteResponse = await fetch(targetUrl, {
          headers: {
            Accept: "text/html,application/xhtml+xml",
            "User-Agent": "TypeScript-Site-Checker/1.0",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });

        if (!siteResponse.ok) {
          sendJson(502, {
            error: `対象サイトからHTTP ${siteResponse.status}が返されました。`,
          });
          return;
        }

        const contentType = siteResponse.headers.get("content-type");

        if (contentType !== null && !contentType.includes("text/html")) {
          sendJson(502, { error: "対象URLからHTMLを取得できませんでした。" });
          return;
        }

        const html = await siteResponse.text();
        sendJson(200, { html });
      } catch (error) {
        const isTimeout =
          error instanceof Error &&
          (error.name === "TimeoutError" || error.name === "AbortError");

        sendJson(isTimeout ? 504 : 502, {
          error: isTimeout
            ? "対象サイトの取得がタイムアウトしました。"
            : "対象サイトのHTMLを取得できませんでした。",
        });
      }
    });
  },
});

export default defineConfig({
  plugins: [siteFetchApi()],
});
