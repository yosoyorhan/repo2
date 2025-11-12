# 🎨 LIVENNER Cyberpunk Tasarım Sistemi

## 🌟 Tasarım Felsefesi

LIVENNER'ın yeni tasarım dili **Jules** (eski adıyla Porter) tasarımından ilham alarak oluşturulmuştur. **Cyberpunk/Developer Aesthetic** tarzında, koyu mor arka plan üzerine **Neon Pembe** ve **Camgöbeği (Cyan)** vurgularıyla modern, topluluk odaklı bir deneyim sunar.

## 🎨 Renk Paleti

### Ana Renkler (Cyberpunk Dark)
```css
--cyber-dark: #0f0518           /* Ana arka plan */
--cyber-dark-purple: #130b25    /* Kart arka planı */
--cyber-deep-purple: #1e1235    /* Window header */
--cyber-surface: #2d1b4e        /* Buton & input arka planı */
```

### Neon Vurgu Renkleri
```css
--neon-pink: #ff0080           /* Primary CTA, vurgular */
--neon-pink-dark: #d6006b      /* Hover durumu */
--neon-cyan: #00f0ff           /* Secondary vurgu, ikonlar */
--neon-purple: #7928ca         /* Gradient desteği */
--neon-yellow: #facc15         /* Uyarılar */
```

### Border & Effects
```css
--cyber-border: rgba(255, 255, 255, 0.1)      /* Ana border */
--cyber-border-light: rgba(255, 255, 255, 0.05) /* Subtle border */
```

## ✨ Temel Tasarım Özellikleri

### 1. Window-Style Kartlar
Her önemli içerik **macOS tarzı pencere başlıkları** ile gösterilir:
```jsx
<div className="window-style">
  <div className="window-header">
    <div className="flex space-x-2">
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
    </div>
    <div className="text-xs font-mono text-gray-500">live_stream.exe</div>
  </div>
  {/* İçerik */}
</div>
```

### 2. Neon Glow Efektleri
Önemli elementlerde **glow shadow** kullanılır:
```jsx
<button className="shadow-neon-pink hover:shadow-neon-pink-md">
  Tıkla
</button>
```

### 3. Gradient Metinler
Başlıklar ve önemli yazılar için:
```jsx
<h1 className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan">
  LIVENNER
</h1>
```

### 4. Monospace Font
Teknolojik hava için tüm UI elementlerinde **JetBrains Mono** kullanılır:
```css
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

## 🧩 Component Tasarım Kuralları

### Butonlar
```jsx
// Primary (Neon Pink)
<Button>Ana Aksiyon</Button>

// Secondary (Neon Cyan)
<Button variant="secondary">İkincil Aksiyon</Button>

// Outline (Cyber Border)
<Button variant="outline">Keşfet</Button>

// Ghost (Transparent)
<Button variant="ghost">İptal</Button>
```

### Input/Form Alanları
```jsx
<Input 
  placeholder="Mesajınız..." 
  className="bg-cyber-surface border-cyber-border text-white placeholder-gray-500"
/>
```

### Kartlar (Stream/Product)
```jsx
<div className="group relative">
  {/* Glow wrapper */}
  <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
  
  {/* Ana kart */}
  <div className="relative window-style">
    {/* İçerik */}
  </div>
</div>
```

## 📐 Spacing & Sizing

```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 40px

--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px
```

## 🎭 Animasyonlar

### Pulse Glow (Neon efekt)
```jsx
<div className="animate-pulse-glow-pink">
  Parlayan element
</div>
```

### Float (Hover efekti)
```jsx
<div className="animate-float">
  Yüzen element
</div>
```

### Hover Scale
```jsx
<button className="hover:scale-105 transition-all">
  Tıklanabilir
</button>
```

## 🌐 Arka Plan Efektleri

### Noise Texture
```jsx
<div className="bg-noise opacity-5"></div>
```

### Gradient Glow
```jsx
<div className="absolute top-0 left-0 right-0 h-96 bg-neon-purple/20 blur-[120px] rounded-full"></div>
```

## 🎨 Alternatif: Light Theme

Kullanıcı tercihi için `LivennerLightTheme.jsx` componenti hazır durumda:

```jsx
import LivennerLightTheme from '@/components/LivennerLightTheme';
```

### Light Theme Renk Paleti
```css
--light-bg: #f8faff
--light-purple: #6a4bff
--light-pink: #ff66c4
--light-border: #eae6ff
--light-surface: #f4f2ff
```

## 🛠️ Kullanım Örnekleri

### Ana Sayfa Hero
```jsx
<h1 className="text-5xl md:text-7xl font-bold leading-tight">
  Koleksiyonluk Ürünleri <br />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink">
    Canlı Yayında
  </span> Kap.
</h1>
```

### Chat Mesajı
```jsx
<div className="flex items-start gap-2">
  <div className="w-8 h-8 bg-gradient-to-br from-neon-pink to-neon-cyan rounded-full">
    <span className="text-white font-bold">A</span>
  </div>
  <div className="flex-1">
    <span className="text-xs font-mono font-bold text-neon-cyan">username</span>
    <p className="text-sm text-gray-300 bg-cyber-surface/50 p-2 rounded-lg">
      Mesaj içeriği
    </p>
  </div>
</div>
```

### Live Badge
```jsx
<div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> LIVE
</div>
```

## 📚 Kaynaklar

- **İlham:** Jules (Porter) - Developer Landing Page
- **Font:** JetBrains Mono, Inter
- **Framework:** React + Tailwind CSS
- **Animasyon:** Framer Motion

## 🚀 Sonraki Adımlar

- [ ] Dark/Light theme toggle ekle
- [ ] Accessibility (a11y) iyileştirmeleri
- [ ] Component library dokümantasyonu (Storybook)
- [ ] Pixel art ikonlar ekle
- [ ] Ses efektleri (opsiyonel)

---

**Tasarım Sistem Versiyonu:** 1.0.0  
**Son Güncelleme:** Kasım 2025  
**Tasarım Dili:** Cyberpunk/Jules Inspired
