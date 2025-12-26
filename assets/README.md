請將您提供的 logo 圖片放到本專案的 `assets/` 資料夾，並依照下列建議命名：

- `icon.png` — 用於 Welcome 畫面顯示（建議 1024x1024 或 512x512，會自動縮放）。
- `splash-icon.png` — 用於啟動畫面（建議 1200x1200 或與 icon 相同，resizeMode: contain）。
- `adaptive-icon.png` — Android adaptive icon 前景圖（建議 432x432，透明背景）。
- `favicon.png` — Web favicon（建議 64x64 或 32x32）。

替換步驟：
1. 下載你在聊天室上傳的圖片（或使用附件）。
2. 將圖片複製/貼上到此專案的 `assets/` 資料夾。
3. 重新命名對應檔案為上面建議的檔名（例如 `icon.png`）。
4. 重新啟動 Expo 或重新建置 app（`expo start` / `yarn android` / `yarn ios`）。

備註：
- `WelcomeScreen` 已改為從 `assets/icon.png` 載入 logo 圖片。
- 若要同時更換作業系統的 app icon，請以相容尺寸替換 `assets/icon.png`（`app.json` 目前指向 `./assets/icon.png`）。
