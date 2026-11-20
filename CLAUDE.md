# FlashTube

youtube.com üzerine hızlı ve özelleştirilebilir bir katman: **tarayıcı eklentisi** (Manifest V3; önce Edge ve Chrome,
sonra Firefox). Hedef: **hiçbir YouTube özelliğini kaybetmeden** (Premium dahil, çünkü gerçek site açık) görünüm ve
işlevi özelleştirmek, ve bunu performansa yük getirmeden yapmak.

Eski Avalonia masaüstü denemesi `arsiv/avalonia` etiketinde duruyor; bu dalda yok.

## Yapı

| Yol | Ne |
|---|---|
| `src/manifest.json` | Eklenti bildirimi; sürüm derlemede `package.json`'dan yazılır |
| `src/content/main.ts` | youtube.com'a `document_start`'ta enjekte edilen giriş |
| `src/content/feature.ts` | `Feature` sözleşmesi: `rootClass` (CSS kısmı) + isteğe bağlı `apply()` (JS kısmı) |
| `src/content/features/` | Her özellik ayrı dosya; `index.ts`'deki `FEATURES` listesine kaydedilir |
| `src/content/dom-watcher.ts` | Bütün özelliklerin paylaştığı tek `MutationObserver` (kare başına toplu) |
| `src/content/navigation.ts` | YouTube'un sayfa geçişleri (`yt-navigate-finish`), yoklama yok |
| `src/content/root-classes.ts` | `<html>` sınıfları + titremeyi önleyen localStorage önbelleği |
| `src/shared/settings.ts` | Ayar şeması, varsayılanlar, doğrulama, `chrome.storage.sync` |
| `src/popup/` | Ayarlar paneli (arayüzü henüz taslak) |
| `src/styles/features.css` | Özelliklerin CSS kuralları, hepsi `html.ft-…` ile kapsamlı |
| `src/styles/tokens.css` | DesignKit tokenları CSS değişkeni olarak (yalnız eklentinin kendi yüzeyleri için) |
| `src/_locales/{en,tr}/` | Metinler (`chrome.i18n`) |
| `tools/build.mjs` | esbuild ile `dist/`'e derleme |
| `tests/` | Vitest |

## Performans kuralları (özellik kaybetmeden)

1. **Önce CSS**: Bir özellik CSS ile yapılabiliyorsa `rootClass` + `features.css`. Kapalı özellik sıfır maliyet.
2. **Titreme yok**: Son sınıflar youtube.com'un localStorage'ında önbelleklenir ve `document_start`'ta eşzamanlı uygulanır.
3. **Tek gözlemci**: Özellikler kendi `MutationObserver`'ını açmaz, `context.dom.watch(selector, cb)` kullanır.
4. **Yoklama yok**: `setInterval` / URL izleme yok; `context.navigation.onChange` kullanılır.
5. **Framework yok** içerik betiğinde; çıktı küçük kalır (şu an ~3 KB JS).
6. **Seçiciler**: YouTube'un özel elementleri ve öznitelikleri (`ytd-…`, `[is-shorts]`, `a[href^="/shorts/"]`); üretilmiş
   sınıf adları değil. **Asla kapsayıcı gizleme** (`ytd-item-section-renderer` arama sayfasında bütün sonuçları taşır).
   Her yeni seçici gerçek youtube.com'da denenir.
7. Bir özellik hata verirse diğerleri çalışmaya devam eder (`main.ts` her `apply`'ı ayrı yakalar).

## Kurallar

- **Kod İngilizce** (adlar, yorumlar, commit). Kullanıcı metni `_locales` içinde, İngilizce ve Türkçe.
- **Reklam engelleme ve video indirme yok** (YouTube kurallarına aykırı, hesabı riske atar).
- **Silme**: rekürsif silme yok. Yalnız adı belli tek dosya. Kullanıcının verisini kullanıcı siler.
- **Ajan kullanılmaz.**

## Komutlar

```powershell
npm run check     # tip denetimi + testler + derleme
npm run watch     # değişiklikte yeniden derle
```

Yükleme: Edge'de `edge://extensions` (Chrome'da `chrome://extensions`) → Geliştirici modu → **Paketlenmemiş öğe yükle**
→ `dist` klasörü. Kod değişince eklenti kartındaki yenile düğmesine basılır, sonra YouTube sekmesi yenilenir.
