
# Asil Kuyumculuk Yeni Panel

Bu proje, mevcut sistemin verisini kullanarak temiz yapıda yeni bir arayüz sunar.

## Dosyalar
- `index.html` : arayüz
- `style.css` : tasarım
- `app.js` : uygulama mantığı
- `manifest.json` : müşteri uygulaması
- `manifest-admin.json` : yönetici uygulaması
- `worker.js` : referans worker dosyası

## Kullanım
Normal:
- `/index.html`

Admin:
- `/index.html?admin`

## Not
Bu sürüm, mevcut canlı worker adresini kullanır:
- `https://altin-proxy.ufuk87900.workers.dev`

İstersen bu adresi `app.js` içinde değiştirebilirsin.
