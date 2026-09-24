# MovieHub 電影庫

一個以 [TMDB API](https://www.themoviedb.org/documentation/api) 為資料來源的電影瀏覽網站，使用 React + TypeScript + Vite 打造。可瀏覽熱門/近期上映/好評/即將上映的電影、依類型篩選、搜尋、查看電影與演員詳細資訊，並將喜愛的電影加入本機收藏清單。

## 功能特色

- **首頁輪播 Hero**：自動輪播熱門電影，可播放預告片、加入收藏、前往詳細頁
- **分類瀏覽**：正在熱映 / 熱門電影 / 高分好評 / 即將上映，各分類皆可橫向捲動並無限載入下一頁
- **類型篩選**：點選類型標籤（動作、喜劇、恐怖…）以 Discover API 撈出該類型電影，並支援捲動載入更多
- **搜尋**：輸入關鍵字後 debounce 500ms 自動查詢，並可中斷前一次未完成的請求
- **電影詳細頁**：海報、劇情簡介、評分、片長、類型、預告片、卡司陣容、相關推薦（無推薦時自動改用相似電影）
- **演員詳細頁**：個人照片、基本資料、外部社群連結（IMDb / Facebook / Instagram / X / TikTok / Wikipedia）、出演作品
- **我的收藏**：以 Redux 管理收藏電影清單，並同步持久化到 `localStorage`，重新整理後仍保留
- **全站載入狀態**：以請求計數器統一控制 Loading 動畫，避免多重請求互相覆蓋載入狀態
- **響應式介面（RWD）**：手機／平板／桌機皆有對應版型，含手機版漢堡選單

## 技術棧

| 分類 | 使用技術 |
| --- | --- |
| 框架 | React 18 + TypeScript |
| 建置工具 | Vite |
| 路由 | React Router v7（含 `loader` 資料預載、`lazy` 路由拆分） |
| 狀態管理 | Redux Toolkit + React Redux |
| 樣式 | Tailwind CSS |
| HTTP | Axios（自訂 instance + 請求/回應攔截器） |
| Lint | ESLint（`@typescript-eslint`、`react-hooks`、`react-refresh`） |

## 專案結構

```
api/
└── tmdb/[...path].ts  # Vercel Serverless Function，代理 TMDB 請求並在伺服器端附加 Bearer Token（見下方「TMDB Token 代理」）

src/
├── api/            # Axios 實例與 TMDB API 封裝（movie.ts / person.ts），實際打到 /api/tmdb
├── components/     # 可重用元件（卡片、按鈕、輪播、骨架屏…）
├── constants/       # 類型（genre）常數與中文名稱對照
├── hooks/           # 自訂 hook（如輪播 useSlide）
├── layouts/         # 版面元件（Header / Footer / MainLayout / CastSlide / HomeRows）
├── pages/           # 各路由頁面（Home / Search / MovieDetails / PersonDetails / Favorite / NotFound）
├── reducer/         # Redux reducer（載入狀態、收藏清單）
├── routers/         # 路由設定與路徑常數
├── store/           # Redux store 設定（含收藏清單持久化到 localStorage）
└── utils/           # 共用工具函式（圖片網址組合、型別定義等）
```

路徑別名 `@/` 對應 `src/`（見 `vite.config.ts`、`tsconfig.json`）。

## 開始使用

### 事前準備

- [Node.js](https://nodejs.org/)（建議 v18 以上）
- [TMDB API](https://www.themoviedb.org/settings/api) 帳號，取得 **API Read Access Token（v4 auth）**

### 安裝

```bash
npm install
```

### 環境變數

複製 `.env.example` 為 `.env`，並填入你的 TMDB Token：

```bash
cp .env.example .env
```

| 變數 | 說明 |
| --- | --- |
| `TMDB_API_TOKEN` | TMDB API Read Access Token（必填，需自行至 TMDB 帳號設定申請）。**不加** `VITE_` 前綴，只在伺服器端（`api/tmdb/[...path].ts` 與本機 dev proxy）使用，不會打包進前端、也不會暴露給瀏覽器 |
| `TMDB_BASE_URL` | TMDB API 基底網址，預設 `https://api.themoviedb.org/3`。同樣只在伺服器端使用 |
| `VITE_IMAGE_URL` | TMDB 圖片 CDN 網址，用於組合海報／背景圖 |
| `VITE_YOUTUBE_URL` / `VITE_YOUTUBE_URL_FOR_USER` | 用於嵌入預告片 iframe |
| `VITE_IMDB_URL` / `VITE_FACEBOOK_URL` / `VITE_INSTAGRAM_URL` / `VITE_X_URL` / `VITE_TIKTOK_URL` / `VITE_WIKIPIEDIA_URL` | 演員頁社群連結前綴，會與 TMDB 回傳的帳號 ID 組合成完整連結 |

#### TMDB Token 代理

前端不會直接帶著 Token 呼叫 TMDB，而是打同網域的 `/api/tmdb/*`：

- **正式環境（Vercel）**：由 `api/tmdb/[...path].ts` 這個 Serverless Function 接住請求，從 `process.env.TMDB_API_TOKEN` 讀取 Token 後轉發給 TMDB，Token 全程不會出現在前端打包產物或瀏覽器請求中。
- **本機開發（`vite dev`）**：`vite.config.ts` 設定了等效的 dev server proxy，直接讀取 `.env` 裡的 `TMDB_API_TOKEN` 轉發，行為與正式環境一致。

因此部署到 Vercel 時，`TMDB_API_TOKEN` / `TMDB_BASE_URL` 可以安全地設為 **Sensitive**（Vercel 後台會擋你把帶 `VITE_` 前綴的變數設為 Sensitive，因為那類變數本來就會被打包進前端公開；改名去掉前綴後就沒有這個限制了）。

### 開發

```bash
npm run dev
```

### 建置 / 預覽

```bash
npm run build     # tsc 型別檢查 + vite build，輸出到 dist/
npm run preview   # 本機預覽 build 後的成果
```

### Lint

```bash
npm run lint
```

## 路由一覽

| 路徑 | 頁面 | 說明 |
| --- | --- | --- |
| `/` | Home | 首頁，含 Hero 輪播與分類列表；帶 `?genre=<id>` 時顯示該類型篩選結果 |
| `/search` | Search | 電影搜尋 |
| `/movieDetails/:id` | MovieDetails | 電影詳細資訊（路由 loader 預先載入資料） |
| `/person/:id` | PersonDetails | 演員詳細資訊（路由 loader 預先載入資料） |
| `/favorite` | Favorite | 我的收藏清單 |
| `*` | NotFound | 404 頁面 |
