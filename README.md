# 🧱 BurakBlast

**Blokları yerleştir, çizgileri patlat, kombonun tadını çıkar. Tahta dolmadan önce.**

[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/burakkmert/burakblast/actions/workflows/ci.yml/badge.svg)](https://github.com/burakkmert/burakblast/actions/workflows/ci.yml)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Capacitor](https://img.shields.io/badge/Capacitor-8-119eff.svg?logo=capacitor&logoColor=white)](https://capacitorjs.com)

> 📸 **Ekran görüntüsü yeri:** oyun ekranı görüntülerini `docs/screenshots/` klasörüne ekleyip buraya bağla:
> `![Oyun ekranı](docs/screenshots/oyun.png)`

## Nedir?

BurakBlast, 8x8'lik bir tahtaya parçaları sürükleyip bıraktığın bir blok bulmaca oyunu. Satırı ya da sütunu doldurursan patlar, puan kazanırsın. Hiçbir parça sığmayınca oyun biter. Tarayıcıda çalışır, Capacitor sayesinde Android uygulaması olarak da derlenir.

## Özellikler

- 🔥 **Kombo sistemi:** art arda çizgi patlat, çarpan büyüsün. Aynı anda birden fazla çizgi çok daha değerli.
- 🎨 **Kendi bloğunu tasarla:** 5x5 ızgarada çiz, renk seç, ne sıklıkla geleceğine karar ver.
- 🖼️ **Blok temaları ve fotoğraf teması:** Jelibon, Düz, Neon, Pastel ya da galerinden bir fotoğraf.
- 🔊 **Ses ve titreşim:** sesler kodla üretilir, dosya yok. Titreşim Android'de de çalışır.
- 💾 **Kaldığın yerden devam:** uygulamayı kapat, oyun seni bekler.
- 📱 **Android desteği:** tek kod tabanı, web ve telefon.
- 🎯 **Adil parça üretimi:** yeni parçalardan en az biri her zaman sığar (ayarlardan kapatılabilir).

## Nasıl Oynanır?

1. Alttaki parçaları sürükleyip tahtaya bırak.
2. Bir satırı veya sütunu tamamen doldurursan patlar.
3. Art arda patlatarak kombo yap, puanın uçsun.
4. Parçalar döndürülemez. Hiçbiri sığmayınca oyun biter.

## Kurulum ve Çalıştırma (web)

Node.js 22 veya üstü gerekir.

```bash
npm install
npm run dev       # geliştirme sunucusu
npm run build     # dist/ klasörüne üretim derlemesi
npm run preview   # derlemeyi yerelde aç
```

Geliştirici paneli için `src/config.js` içinde `DEV_MODE = true` yap. Panel yalnızca `npm run dev` ile gelir, üretim derlemesine hiç girmez.

## Android'e Derleme

```bash
npm run android   # derle, senkronla ve Android Studio'yu aç
npm run phone     # derle, senkronla ve bağlı telefonda çalıştır
```

1. [Android Studio](https://developer.android.com/studio) ve Android SDK kurulu olmalı.
2. Telefonda geliştirici seçeneklerini aç. Kablosuz hata ayıklama için aynı Wi-Fi ağında **Kablosuz hata ayıklama** seçeneğini aç ve Android Studio'dan eşleştir.
3. `npm run phone` ile uygulamayı doğrudan telefonda başlat.
4. Performansı ölçmek için telefon bağlıyken Chrome'da `chrome://inspect` sayfasını aç.

## Proje Yapısı

```
src/
├── core/       Saf oyun mantığı (tahta, parçalar, puan, oyun sonu, rastgelelik). Hiçbir şeyi import etmez.
├── state/      Oyun durumu, ayarlar, parça deposu ve kayıt. localStorage'a yalnızca storage.js dokunur.
├── ui/         Çizim, sürükle-bırak, menü, ekranlar, efektler, temalar ve metinler (strings.js).
├── platform/   Ses, titreşim ve Android'e özel kodlar (geri tuşu, uygulama durumu).
├── styles/     CSS parçaları, styles/index.css'ten içe aktarılır.
├── config.js   Ayarlanabilir sabitler: puanlar, süreler, DEV_MODE.
└── main.js     Başlatma ve katmanları birbirine bağlama.
```

Bağımlılık yönü: `ui` ve `platform` → `state` → `core`. Döngüsel import yok.

## Testler

```bash
npm test          # Vitest: src/core birim testleri
npm run lint      # ESLint
npm run format    # Prettier
```

## Yol Haritası

- [ ] 🏆 Çevrimiçi skor tablosu
- [ ] 🎨 Daha fazla tema
- [ ] 📅 Günlük görevler

## Katkıda Bulunma

Hata bildirimleri ve pull request'ler açığız. Göndermeden önce `npm run lint`, `npm test` ve `npm run build` komutlarının geçtiğinden emin ol. Oyun mantığındaki değişiklikler için `src/core` altına test ekle.

## Lisans

[MIT](LICENSE) © 2026 Burak

---

_Block Blast tarzı oyunlardan ilham alınmıştır; herhangi bir şirketle bağlantısı yoktur._
