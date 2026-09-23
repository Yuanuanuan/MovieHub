# MovieHub 細節修正計畫（第三輪）

使用者在第二輪修正（Header/Hero/Loading/Footer/i18n/字型）之後實際操作，回報 15 項細節問題。本計畫記錄逐項的根因診斷、已確認的設計決定、以及實作拆解。

## 已確認的設計決定

透過一份對照用的 Artifact（https://claude.ai/artifact/8hRgLwqvAPS6m2SsPbWswa）及一輪 AskUserQuestion 確認：

| 項目 | 決定 |
|---|---|
| 1. Header 底部分隔 | **方案 C**：Header 下緣疊一層黑→透明陰影（約 30px），製造浮於內容上方的深度感 |
| 4. 分類 chip 用途 | **做成真篩選**：點任一分類（含動作/喜劇）都改用 `getMoviesByGenre` 抓結果、換成篩選後的網格；不再是「跳到錨點」的半調子行為 |
| 6. 橫向片單左右按鈕 | **方案 B**：漸層淡出＋純箭頭，取代目前的實色深底方塊 |
| 7. Hero 輪播指示器 | **方案 B**：Instagram 限時動態式分段進度條（已播完=全紅、目前=即時填色、未到=暗色），填色節奏對齊 5.5 秒輪播、手動點擊會重置 |
| 10. 演員卡片尺寸 | 確認放大（112px → 160px 照片），OK 沒問題 |
| 11. 演員卡片可點擊提示 | 一併補上（外框、輕微放大） |
| 12. 推薦片單卡片尺寸 | 縮小到約 200px 寬（桌機） |
| 2. 字體改回 Noto Sans TC | 排在**最後一個任務**，方便用 git revert 那顆 commit 比較兩種字體效果 |

## 逐項任務拆解

### 任務 A｜Slide 垂直誤觸捲動修正（項目 3）
`src/components/Slide.tsx` 的捲動容器用了 `overflow-scroll`（雙向皆可捲動）。排行榜數字用 `position:absolute` 微幅超出卡片底部，被瀏覽器判定為「內容高度大於容器」而出現極小的垂直可捲動範圍。改成只允許水平方向（`overflow-x-auto overflow-y-hidden`）。

### 任務 B｜Hero 文字對比度修正（項目 5）
`src/components/Hero.tsx` 的標題容器缺少 `text-white`，標題與「詳細資訊」按鈕文字吃到瀏覽器預設黑色文字。在內容容器加上 `text-white`。

### 任務 C｜預告片一鍵播放（項目 8）
`src/components/Hero.tsx`、`src/components/TrailerFacade.tsx` 的 YouTube iframe `src` 補上 `?autoplay=1&rel=0`，點擊「播放預告」/縮圖後直接播放，不用再按一次 YouTube 內建播放鍵。

### 任務 D｜詳情頁預告片區塊比例（項目 9）
`src/pages/MovieDetails.tsx` 的預告片容器目前寫死 `h-[220px] sm:h-[320px]`，改成 `aspect-video`（16:9，對齊 YouTube 嵌入比例）。

### 任務 E｜搜尋頁狀態與退出（項目 14、15）
- `src/layouts/Header.tsx`：目前頁面判斷只分 home/favorite，`/search` 落入 home 分支導致首頁底線持續亮著；補上 search 分支（不特別高亮任何導覽項目）。
- `src/pages/Search.tsx`：補上返回鍵（樣式比照 `MovieDetails.tsx` 的「返回」按鈕，`navigate(-1)`）。

### 任務 F｜Header 底部陰影漸層（項目 1，方案 C）
`src/layouts/Header.tsx`：背景改回純色，另加一個 `absolute` 陰影層（`top-full`、高度約 30px、`bg-gradient-to-b from-black/55 to-transparent`），疊在內容上方製造深度感。

### 任務 G｜橫向片單左右按鈕重設計（項目 6，方案 B）
`src/components/LeftButton.tsx`、`src/components/RightButton.tsx`：從實色深底方塊改成漸層淡出＋描邊箭頭（`stroke` SVG），套用到所有使用 `Slide` 的地方（首頁各列、演員列、推薦片單列），不用個別調整呼叫端。

### 任務 H｜Hero 進度條指示器（項目 7，方案 B）
`src/components/Hero.tsx`：`hero-dashes` 從純色短橫條改成三態分段（全紅／即時填色／暗色）。填色動畫時長對齊現有 5.5 秒輪播間隔，且要在下列情況正確重置／暫停：
- 手動點擊切換 → 該段重新從 0 開始填色
- hover／focus／預告片播放中 → 暫停填色（呼應現有暫停自動輪播的邏輯）

### 任務 I｜演員卡片放大＋可點擊提示＋按鈕對齊（項目 10、11、13）
- `src/components/CastCard.tsx`：照片 112px → 160px，姓名/角色字級同步放大；整張卡（含姓名）都可點擊進演員頁；加上 hover 外框＋輕微放大提示可點擊。
- `src/layouts/CastSlide.tsx`：修正標題縮排與卡片列起始位置對不齊的問題（`ml-6` vs `Slide` 內部 `px-4`）。

### 任務 J｜推薦片單卡片縮小（項目 12）
`src/components/MovieCard.tsx` 新增尺寸變體（約 200px 寬，含等比例高度／收藏按鈕／字級），`src/pages/MovieDetails.tsx` 的「看過這部的人也喜歡」列套用新變體。

### 任務 K｜分類 chip 真篩選（項目 4）
- 改用網址查詢參數 `?genre=<id>` 作為篩選狀態的單一來源（可分享、上一頁/下一頁可用），取代原本的 hash 錨點捲動。
- `src/pages/Home.tsx`：讀取 `?genre=`；有值時渲染新的篩選結果視圖，取代 `HomeRows`；同時移除現在已經用不到的 hash 錨點自動捲動邏輯。
- 新增 `src/components/GenreResults.tsx`：依 genreId 呼叫 `getMoviesByGenre`，顯示分類標題（取自 `CURATED_GENRES` 的繁體標籤）＋ 電影網格（版面比照 `Search.tsx` 的網格）。
- `src/components/GenreChipRow.tsx`：改為受控元件，依目前 `?genre=` 高亮「全部」或對應分類；點擊導向對應網址而非錨點。
- `src/layouts/Header.tsx`：導覽列「分類」下拉選單與手機選單比照同一套邏輯（導向 `?genre=<id>`）。
- `src/constants/genres.ts`：移除不再使用的 `anchor` 欄位。

### 任務 L｜字體改回 Noto Sans TC（項目 2，最後執行）
`src/index.css`：`body` 的 `font-family` 從 `"LXGW WenKai TC", "Noto Sans TC", ...` 改回以 `"Noto Sans TC"` 為主。維持 LXGW 的 `@import` 留著或移除皆可（傾向移除，避免多載入不用的字型檔案）。

## 執行順序

A → B → C → D → E → F → G → H → I → J → K → L

前面 10 項（A–J）多為局部、彼此互不衝突的修正，逐一直接實作＋各自驗證。K（真篩選）改動範圍較大，安排在其餘修正之後、字體之前。L 固定最後執行。

每個任務完成後跑 `tsc --noEmit` + `lint`，全部完成後再跑一次 `build` 並用瀏覽器實際操作驗證關鍵路徑（Hero 輪播/進度條、片單左右按鈕、演員卡點擊、分類真篩選、搜尋頁返回）。
