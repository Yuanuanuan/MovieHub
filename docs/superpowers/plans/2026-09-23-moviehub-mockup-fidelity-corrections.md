# MovieHub 設計稿修正計畫書

日期：2026-09-23
狀態：決策已確認，執行中（見文末「已確認決策」與「執行任務拆分」）
對應設稿：["MovieHub Reel Cut"](https://claude.ai/artifact/9sqjXqFxYqMaTqTygGLMZc)（互動式 HTML 設稿）
對應前次工作：`docs/superpowers/plans/2026-09-22-moviehub-mockup-fidelity.md`（已實作，12 個任務 + 最終整體審查修正，共 13 個 commit）

---

## 0. 開場：關於「有沒有認真比對設計稿」

老實說，前一輪只讀了 `docs/superpowers/specs/2026-09-22-moviehub-mockup-fidelity-design.md` 這份文字規格，**沒有把「MovieHub Reel Cut」這份設稿的 HTML/CSS/JS 原始碼整份讀過、逐一比對每個元件的實際樣式**。文字規格轉譯設稿的過程中本身就漏了、也翻譯錯了幾個地方（例如排行榜數字的描邊顏色、卡片 hover 上浮動畫最後被自己加的 `overflow-hidden` 蓋掉），最終審查也只檢查了程式碼內部的邏輯一致性，沒有真的拿真實設稿逐項核對視覺。

這次直接把設稿的完整原始碼讀出來重新比對，你點名的 7 點全部屬實，而且额外抓到了 4 個你沒點名、但同樣有落差的地方，一併列在下面（第 8 節）。

---

## 1. Header Logo

**現況**（`src/components/Logo.tsx`）：純文字「MovieHub」，字型 `font-freeman`（Freeman），`text-4xl`，沒有任何圖示。

**設稿**（`.brand` / `.brand svg`）：SVG 圖示（26×26，`fill: var(--accent)` 紅色，膠卷/日曆格線圖案）＋ 文字「MovieHub」，文字用 `Bebas Neue`、`font-size:22px`、`letter-spacing:.03em`。

**落差**：完全沒有圖示；字型用錯（該用 Bebas Neue，現在用 Freeman）；尺寸明顯偏大。

**修正**：`Logo.tsx` 加回設稿的 SVG 圖示（`fill-primary`），文字改 `font-bebas`，尺寸從 `text-4xl` 調小到接近 22px 的比例（約 `text-2xl`），圖示與文字間距抓 `gap-2` 左右。

---

## 2. 整體字體

**現況**：`src/index.css` 已經設了 `body { font-family: "Noto Sans TC", serif; }`，跟設稿的 body 字體一致。但個別元件蓋掉了這個設定：
- `src/layouts/Header.tsx` 導覽連結（首頁／分類／我的收藏）用了 `font-roboto`
- `src/components/Logo.tsx` 用了 `font-freeman`

**設稿**：整份設稿只用兩款字體——內文（含導覽列文字）一律 `Noto Sans TC`（400/500/700/900 字重），只有少數強調用途（Logo、Hero 的「本週精選」眉標、排行榜數字、預告片播放提示文字）改用 `Bebas Neue`。**完全沒有用到 Roboto 或 Freeman。**

**落差**：Header 導覽用了不該用的 Roboto；Logo 用了不該用的 Freeman，造成同一畫面三種字體混雜。

**修正**：拿掉 Header 導覽項目上的 `font-roboto`（讓它自然繼承 body 的 Noto Sans TC），Logo 改 `font-bebas`。這兩款字體 `index.css` 已經用 `@import` 載入了，不用新增字體檔。

**字型挑選建議**（回應「幫我挑一下好看的、有設計感的」）：
建議**直接沿用設稿原本核准的搭配**——`Noto Sans TC` 是目前最完整、多字重、閱讀性最好的繁中無襯線字體；`Bebas Neue` 是電影海報／院線網站常見的窄體大寫展示字，兩者對比明確，很有「影評/選片網站」的設計感，而且這正是設稿當初核准的決定，不需要另外挑。

如果你想要文字更有「雜誌/編輯感」，可以加碼一個備案（**設稿沒有這個做法，是額外選項**）：內文維持 Noto Sans TC，但大標題（Hero 片名、電影詳情頁片名）換成 `Noto Serif TC` 襯線字，增加質感對比——`tailwind.config.js` 已經有 `notoSerif` 這個 token 可以直接用，不用改設定檔。要不要採用由你決定。

---

## 3. + 7. 分隔線（紅黑漸層線）

**現況**：`src/index.css:71-76` 定義了 `.hr`：

```css
.hr {
  width: 85%;
  height: 4px;
  border: none;
  background: linear-gradient(90deg, #cf2b22, #141414);
}
```

目前用在：
- `src/layouts/HomeRows.tsx:75` — 首頁每個區塊（最新上映／熱門電影／…）結束都加一條，**共 6 條**
- `src/pages/MovieDetails.tsx:150、154、163` — 演員區塊前、推薦區塊前、頁面最尾端，**共 3 條**

**設稿**：完全沒有這種分隔線。區塊之間單純靠 `.row-block { margin-bottom: 8px; }` 的間距分開，沒有任何視覺分隔線元素。

**落差**：這 9 條 `<hr className="hr">` 全部是**上一輪改版沒清掉的舊元素**（改版前的舊設計遺留），是真正的疏漏，不是解讀差異。

**修正**：從 `HomeRows.tsx` 和 `MovieDetails.tsx` 移除所有 `<hr className="hr ...">`，改用區塊間距（`mb-2` 左右）做視覺分隔，貼近設稿的 `margin-bottom:8px`。

`.hr` 這個 class 拿掉這 9 處之後，還剩 `src/components/PersonIfno.tsx:23` 和 `src/pages/PersonDetails.tsx:16` 在用——這兩個頁面不在這次設稿範圍內（上一輪計畫書也明確排除過 `PersonDetails`／`HeaderWithBack`），**先保留不動**，除非你要我一併處理。

---

## 4. Footer（待確認）

**現況**：`src/layouts/Footer.tsx` 完全沒被上一輪改版碰過——灰階舊配色文字、「Home / TV / Favorite」連結（TV 甚至不是這個 App 有的頁面）、社群圖示（IG/FB/X，設稿沒有對應設計）、著作權文字還刻意歪斜 `-rotate-3` 度。整體風格跟新版暗色系完全不搭。

**設稿**：整份設稿裡**完全沒有 Footer 區塊**（只有 nav + Hero + rows + 詳情頁 + 收藏頁）。

**落差／待確認**：因為設稿本身沒畫 Footer，這裡有兩條路：

- **(A) 完全比照設稿，拿掉 Footer**——頁面到收藏頁內容結束就沒有頁尾了。
- **(B) 保留 Footer，但重新設計**成跟新版視覺一致的暗色系版本（拿掉 TV 連結、拿掉歪斜文字與社群圖示或重新設計、Logo 套用新的圖示+字體）。

**建議**：(B)，比較符合真實產品的期待。但這是設稿沒明講的部分，最終要你決定。

---

## 5. 全中文化 + 字體（字體部分見第 2 節）

**翻譯範圍盤點**：這次改版直接碰到的頁面/元件目前都還是英文文案，設稿其實已經內建了完整的繁中文案可以直接對照沿用：

| 位置 | 現況（英文） | 設稿（繁中） |
|---|---|---|
| Header 導覽 | Home / Genres / Favorite / (搜尋圖示) | 首頁 / 分類 / 我的收藏 / 搜尋 |
| GenreChipRow | All / Action / Comedy / Horror / Sci-Fi / Drama / Animation / Romance / Documentary | 全部 / 動作 / 喜劇 / 恐怖 / 科幻 / 劇情 / 動畫 / 愛情 / 紀錄片 |
| 首頁區塊標題 | New Releases / Popular / Top 10 This Week / Action / Comedy / Coming Soon | 最新上映 / 熱門電影 / TOP 10 本週 / **動作片** / **喜劇片** / 即將上映 |
| Hero | Featured This Week / Play Trailer / Details / (收藏) | 本週精選 / 播放預告 / 詳細資訊 / 加入收藏 |
| MovieDetails | Back / Add to Favorites／Favorited / Share／Copied! / You Might Also Like | 返回 / 加入收藏／已收藏 / 分享 / 看過這部的人也喜歡 |
| Favorite 頁導覽項 | Favorite | **我的收藏** |
| Favorite 頁主標題 | My Favorites | **我的片單**（注意：跟導覽用詞不同，設稿刻意分開兩個詞） |
| Favorite 頁其餘 | "X Movies Saved" / 空清單文案 / "Browse Movies" | 「X 部電影已收藏」／「你還沒有收藏任何電影」／「在海報右上角點擊愛心，之後就能在這裡快速回顧想看的片單。」 |
| CastCard 角色文字 | 直接顯示角色名 | 角色名前面有「**飾 **」前綴（例如「飾 陳警官」），現在版本沒有這個前綴 |

> 注意：分類選單裡的「動作」跟首頁區塊標題「動作片」，設稿是兩個不同用詞，不能共用同一份翻譯——分類是名詞（動作），區塊標題是「片單」語感（動作片）。

**待確認**：全中文化要**只做這次設稿有畫到的頁面/元件**（Header、Hero、首頁區塊、GenreChipRow、MovieDetails、Favorite、FavoriteButton），還是要**連同設稿沒涵蓋的頁面也一起翻**（搜尋頁 `Search.tsx`、404 頁 `NotFound.tsx`、`Loading`、`PersonDetails` 等）？後者範圍更大，這些頁面設稿沒有對應文案，需要我自己擬繁中文案（無法直接照抄設稿）。

---

## 6. Hero「Play Trailer」下方的區塊（待確認）

**先釐清現況跟設稿其實是一致的**：那排小短線（`src/components/Hero.tsx:156-169`）對應設稿的 `.hero-dashes`——功能是「**手動切換 3 部『本週精選』輪播電影**」，不是推薦電影列表。設稿本身、以及最早核准的規格文件（`2026-09-22-moviehub-mockup-fidelity-design.md` §2 Non-goals）都明講：

> No autoplay hero carousel — still manual dash-click navigation only（carried over, and matches the mockup, which is also click-only）

也就是說「手動點擊、不自動輪播」是當初核准設稿本來的設計，**不是這次落掉的落差**。

但你實際用起來，覺得這排指示點看不出來是「切換精選電影」，以為是別的東西——這是真實的可用性問題，值得處理，只是已經超出「照抄設稿」的範圍，是要不要新增設稿沒有的行為，需要你決定方向：

- **(A) 維持設稿原本「手動點擊、不自動輪播」**，但把指示點做得更有語意（例如換成 3 張精選電影的小縮圖，而不是純線條；或加一行極小字提示），讓使用者一眼看懂在幹嘛，但仍然要手動點。
- **(B) 改成自動輪播**（例如每 5–6 秒自動切下一部，滑鼠移入時暫停，使用者仍可手動點指示點跳過）——比較貼近你現在的直覺回饋，但會偏離當初核准設稿與規格文件明講的決定。

**建議**：(B) 較貼近你目前的實際使用回饋，只要記得手動互動時要暫停自動輪播、滑出後恢復，避免使用者選好想看的卻立刻被切走。但因為這牴觸先前明確核准的規格，不會自己擅自決定，先跟你確認要 A 還是 B。

---

## 8. 額外找到、你沒點名的落差

既然要認真比對，一併列出這次重新逐項核對時多抓到的：

1. **排行榜數字描邊顏色/尺寸錯**：`src/components/MovieCard.tsx:21-27`（Top 10 卡片左下角的空心數字）現在用**白色半透明**描邊 `rgba(255,255,255,0.25)`、字級 **88px**；設稿 `.rank-num` 其實是**接近背景色的深灰**描邊 `var(--line)`（#2b2a2e）、字級只有 **74px**——效果應該是「幾乎融入背景的低調浮水印數字」。現在因為描邊是白色，反而比設稿顯眼很多，等於做反了視覺強度。
   **修正**：描邊色改成接近 `--bg-raise-2`／深灰（例如 `rgba(33,33,38,0.9)` 或直接用一個新的深灰 token），字級改 74px。

2. **卡片 hover 上浮動畫其實看不到**：`MovieCard.tsx` 的 `<Link>` 因為要裁切海報圓角＋底部漸層字幕條，加了 `overflow-hidden`，導致 `hover:-translate-y-1`（對應設稿 `translateY(-4px) scale(1.045)` 的上浮效果）雖然寫在程式碼裡，實際 hover 時卻被 `overflow-hidden` 裁掉看不出來，只看得到縮放。這件事在上一輪最終整體審查時已經抓到過（列為次要、暫緩），這次既然要對齊設稿視覺，建議一併處理：把 `overflow-hidden`／圓角改放到海報 `<img>` 自己的容器上（而不是最外層 `<Link>`），讓上浮動畫可以真的位移出來。

3. **演員卡照片偏小**：`CastCard.tsx` 目前圓形照片是 `w-24 h-24`（96px）；設稿整張演員卡寬度 126px，照片幾乎是滿版正方形（約 120px 上下）圓形——現在的照片明顯比設稿小一圈、比例不對。
   **修正**：把照片尺寸放大到接近卡片寬度（例如 `w-28 h-28` 或依 Tailwind 斷點微調）。

4. **分類下拉選單行為**：目前桌機版「分類」hover 展開的行為跟設稿一致，沒有發現落差——列出來讓你知道有比對到，不是漏講。

---

## 9. 修正任務清單（決策確認後即可執行）

| # | 項目 | 檔案 | 是否需要你先決策 |
|---|---|---|---|
| 1 | Logo 加圖示、字型改 Bebas Neue、尺寸調整 | `Logo.tsx` | 否 |
| 2 | Header 導覽拿掉 `font-roboto` | `Header.tsx` | 否 |
| 3 | 移除所有 `<hr className="hr">`（首頁 6 條、詳情頁 3 條） | `HomeRows.tsx`、`MovieDetails.tsx` | 否 |
| 4 | Footer 拿掉或重新設計 | `Footer.tsx` | **是**（A/B） |
| 5 | 全站文案改繁體中文（含分類/區塊標題精準對應設稿用詞） | Header、Hero、HomeRows、GenreChipRow、MovieDetails、Favorite、FavoriteButton，及所有 aria-label／alt 文字 | **是**（翻譯範圍 A/B） |
| 6 | Hero 精選指示點：加強視覺 或 改自動輪播 | `Hero.tsx` | **是**（A/B） |
| 7 | 排行榜數字描邊顏色、尺寸修正 | `MovieCard.tsx` | 否 |
| 8 | 卡片 hover 上浮動畫修正（overflow-hidden 位置） | `MovieCard.tsx` | 否 |
| 9 | 演員卡照片尺寸放大 | `CastCard.tsx` | 否 |

---

## 10. 已確認決策

1. **Footer**：重新設計保留（B）——拿掉 TV 連結／歪斜文案／舊版配色，套用新暗色系視覺與新 Logo。
2. **Hero 精選指示點**：改成自動輪播（B）——每 5–6 秒自動切換，滑鼠移入／取得焦點時暫停，移出後恢復，使用者仍可手動點擊指示點跳過並重新計時。
3. **全中文化範圍**：全站翻譯——不只設稿涵蓋的頁面，連 `Search.tsx`、`NotFound.tsx`、`ErrorBoundaryPage.tsx`、`PersonDetails.tsx`／`PersonIfno.tsx`、`HeaderWithBack.tsx`、`TrailerFacade.tsx`、`SocialMedia.tsx`、`LeftButton`／`RightButton` 等設稿沒涵蓋的頁面/元件也一併翻譯（這些頁面沒有設稿文案可抄，由我擬繁中文案，語氣比照設稿其餘頁面）。

## 11. 執行任務拆分

沿用跟上一輪一樣的 subagent-driven-development 流程（每個任務獨立實作＋審查，最後整體審查）。為了減少調度成本，把同類型的小改動合併成同一個任務：

- **Task 1（視覺/結構修正）**：Logo 加圖示＋字型改 Bebas Neue＋縮小尺寸；Header 拿掉 `font-roboto`；移除 `HomeRows.tsx`（6 處）與 `MovieDetails.tsx`（3 處）所有 `<hr className="hr">`；`MovieCard.tsx` 排行榜數字描邊改深灰＋字級改 74px，並修正 `overflow-hidden` 位置讓 hover 上浮動畫可見；`CastCard.tsx` 照片放大。
- **Task 2（Footer 重新設計）**：`Footer.tsx` 全面重做，暗色系、拿掉 TV 連結／歪斜文案／不相關社群圖示，套用新 Logo。
- **Task 3（Hero 自動輪播）**：`Hero.tsx` 改成自動輪播 + hover/focus 暫停 + 手動點擊仍可用。
- **Task 4（全站繁體中文化）**：`src/constants/genres.ts` 分類標籤、`HomeRows.tsx` 區塊標題、`Header.tsx`、`GenreChipRow.tsx`、`Hero.tsx`、`MovieCard.tsx`、`FavoriteButton.tsx`、`CastCard.tsx`、`MovieDetails.tsx`、`Favorite.tsx`、`TrailerFacade.tsx`、`NotFound.tsx`、`ErrorBoundaryPage.tsx`、`Search.tsx`、`HeaderWithBack.tsx`、`PersonIfno.tsx`、`SocialMedia.tsx`、`LeftButton.tsx`、`RightButton.tsx` 的所有英文文案、`aria-label`、`alt`、`placeholder` 全部改繁體中文。

完成後會再跑一次整體 review，確認沒有遺漏或新增的落差。
