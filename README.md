# Signal Lab | Threads 流量實驗室

繁體中文、深色、行動版 Threads 私人實驗工作區。保留原型視覺與操作，使用 ChatGPT Sites 原生 **D1** 保存 `posts`、`snapshots`、`screenshots`，使用 **R2** 保存未壓縮原始截圖與封面。

## 使用

- 總覽：各篇最新快照的觀看、觸及、檔案瀏覽、追蹤與來源比例。
- 貼文紀錄：新增、編輯、搜尋；詳情可補充原圖及多次快照。
- 成長實驗：轉換比值、方法限制與下一輪內容實驗。
- 資料與備份：匯出含 Base64 原圖和封面的 JSON；完整驗證與圖片準備成功後才以資料庫交易取代現有紀錄。單張圖片 12MB，匯入 JSON 上限 32MB。
- 所有觀測時間以 `Asia/Taipei`（UTC+8）記錄。觀看不是觸及；跨貼文觸及加總不去重；4h 與 12h 不視為同窗口。沒有合成逐時曲線或推薦演算法因果結論。

## 安全與資料

**本站必須維持 Sites owner-private 存取政策。不要改成公開或增加其他讀者。**

Sites dispatch 在伺服器前限制擁有者存取，並提供可信任的 ChatGPT 身分。一般 API 另要求身分、寫入檢查同源、圖片只透過受保護 API 提供並禁止快取。初始匯入與驗證端點 `/api/lab/bootstrap` 依賴同一個 owner-private 平台邊界，支援 Sites 官方 service-access 路徑；POST 僅能初始化一次。原始 seed 資料與使用者截圖**不在此公開 repo**，必須從私人來源直接匯入已保護的部署。

`app_state.initial_backup` 保存初始數據與 R2 檔案參照，讓重設能恢復初始版本。刪除貼文及還原不會立即清除 R2 原檔，確保初始備份可復原；目前不提供永久清除孤立圖片功能。備份檔包含私人數據，請自行妥善保存。

貼文使用 revision 條件更新；同時在兩裝置編輯會拒絕較舊版本，避免靜默覆蓋。跨裝置同步於載入、切回頁籤與成功儲存後重新讀取伺服器資料。沒有 Threads API 連線。

## 開發與驗證

Node 22.13+；以 repo lockfile 安裝相依套件。使用 Sites skill 的 setup、install、build、package 流程，保留 `.openai/hosting.json` 的 project_id。

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
node --check public/app.js
node tests/integration.mjs
pnpm run build
```

整合測試以 Miniflare 真實 D1/R2 模擬器驗證匿名拒絕、同源驗證、原圖位元一致、單次初始化、多快照、編輯衝突、重啟持久性、匯入失敗不破壞現有資料、含圖備份還原和重設。可用 `SIGNAL_TEST_SEED` 指向私人備份，以同一套測試檢查真實 seed；測試資料和環境不提交。

資料庫遷移由 Drizzle 產生並由 Sites 發佈套用，禁止在請求期間建立或修改 schema。本機與正式資料庫分離。
