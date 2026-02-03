# ✨ Social Engagement Tracker

เครื่องมือช่วย engage กับโพสต์โซเชียลมีเดียสำหรับแฟนคลับ

## 📋 Features

- ✅ ดึงข้อมูลจาก Google Sheets (public)
- ✅ แสดงรายการเรียงจากใหม่ไปเก่า
- ✅ Popup แสดงข้อความพร้อม copy
- ✅ รองรับ X, Instagram, Facebook, TikTok
- ✅ Mark complete + เก็บใน LocalStorage
- ✅ Mobile-first design

---

## 🚀 Quick Start

### 1. Setup Google Sheet

สร้าง Google Sheet ใหม่แล้วตั้งค่า headers ในแถวแรก:

| id | platform | url | x_caption | ig_caption | fb_caption | tiktok_caption | hashtags | note |
|----|----------|-----|-----------|------------|------------|----------------|----------|------|

**ตัวอย่างข้อมูล:**

| id | platform | url | x_caption | ig_caption | fb_caption | tiktok_caption | hashtags | note |
|----|----------|-----|-----------|------------|------------|----------------|----------|------|
| 1 | x | https://x.com/xxx/status/123 | น้ำตาลฟิล์มน่ารักมาก 💕 | | | | #น้ำตาลฟิล์ม | โพสต์ใหม่ |
| 2 | instagram | https://instagram.com/p/abc | | รูปสวยมากค่ะ ✨ | | | #NamtarnFilm | รูปคู่ |

### 2. Publish to Web

1. ไปที่ **File > Share > Publish to web**
2. เลือก **Entire Document** และ **Comma-separated values (.csv)**
3. คลิก **Publish**
4. Copy URL ที่ได้

### 3. ใส่ URL ใน Code

แก้ไขไฟล์ `src/App.tsx`:

```typescript
// บรรทัดประมาณ 48
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?output=csv';
```

### 4. Run Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📱 Platform Notes

### X (Twitter)
- รองรับ Intent URL พร้อมข้อความ
- กดปุ่มจะเปิดหน้า compose tweet พร้อมข้อความ

### Instagram / Facebook / TikTok
- ไม่รองรับ auto-paste
- ต้อง copy ข้อความก่อน แล้วค่อยไปวางเอง

---

## 🌐 Deploy to GitHub Pages

1. สร้าง repository ใหม่บน GitHub
2. Push code ขึ้นไป
3. ไปที่ **Settings > Pages**
4. Source: **GitHub Actions**
5. สร้างไฟล์ `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Install and Build
        run: |
          npm install
          npm run build
          
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 📂 Project Structure

```
social-tracker/
├── src/
│   ├── App.tsx        # Main component
│   ├── main.tsx       # Entry point
│   └── index.css      # Tailwind styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 💡 Tips

- **Row ล่างสุดใน Sheet = แสดงบนสุดในเว็บ** (เพิ่มรายการใหม่ไว้ด้านล่าง)
- Completion state เก็บแยกแต่ละ device (LocalStorage)
- รองรับข้อความแยกตาม platform (x_caption, ig_caption, etc.)
- ถ้าไม่มีข้อความเฉพาะ platform จะใช้ hashtags อย่างเดียว

---

Made with 💜 for fan communities
