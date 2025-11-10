# repo2

## Canlı Yayın Platformu

WebRTC tabanlı canlı yayın ve alışveriş platformu.

### 🚀 Özellikler

- **Canlı Yayın**: WebRTC ile gerçek zamanlı video yayını
- **Önizleme Modu**: Yayın başlamadan kamera ve ayar kontrolü
- **Dikey/Yatay Görüntü**: Dinamik orientation desteği
- **Kamera Değiştirme**: Ön/arka kamera geçişi
- **Realtime Chat**: Supabase ile anlık mesajlaşma
- **Mobil Uyumlu**: Responsive tasarım ve touch-friendly kontroller

### 📦 Kurulum

```bash
npm install
```

### ⚙️ Yapılandırma

`.env` dosyası oluşturup aşağıdaki değişkenleri ekleyin:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Opsiyonel: TURN sunucusu (NAT geçişi için)
VITE_TURN_URL=turn:your-turn-server.com:3478
VITE_TURN_USERNAME=username
VITE_TURN_CREDENTIAL=password

# Opsiyonel: Debug modu
VITE_DEBUG_STREAM=false

# Supabase Management API (migrations için)
SUPABASE_ACCESS_TOKEN=your_access_token
```

### 🗄️ Database Kurulumu

#### Otomatik Migration (Önerilen)

```bash
npm run migrate
```

#### Manuel Migration

Supabase SQL Editor'de aşağıdaki migration'ı çalıştırın:
https://supabase.com/dashboard/project/djxukpbhlbomtvxejxtl/sql

```sql
-- supabase-migration-orientation.sql
ALTER TABLE streams 
ADD COLUMN IF NOT EXISTS orientation text DEFAULT 'landscape' 
CHECK (orientation IN ('landscape', 'portrait'));

COMMENT ON COLUMN streams.orientation IS 'Video orientation: landscape (16:9) or portrait (9:16)';
```

### 🏃 Çalıştırma

```bash
# Development
npm run dev

# Production build
npm run build

# Run migrations
npm run migrate

# Preview
npm run preview
```

### 📱 Mobil Kullanım

- **Portrait Mode**: Dikey görüntü için ideal (mobil cihazlar)
- **Landscape Mode**: Yatay görüntü için ideal (masaüstü)
- Video otomatik olarak ekrana sığacak şekilde ölçeklenir
- Butonlar 44px minimum dokunmatik alan standardına uygun

### 🎥 Canlı Yayın Kullanımı

1. **Yayıncı**: 
   - "Önizleme" ile kamerayı aç ve ayarları yap
   - Dikey/Yatay görüntü seç
   - Ön/Arka kamera geçişi yap
   - "Canlı Yayın Başlat" ile yayına geç

2. **İzleyici**:
   - Yayın linkine tıklayarak katıl
   - Otomatik olarak WebRTC bağlantısı kur
   - "Sesi Aç" butonu ile sesi etkinleştir

### 🔧 Teknik Detaylar

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Auth, Realtime, Database)
- **WebRTC**: RTCPeerConnection, Supabase Broadcast
- **Video**: getUserMedia API, replaceTrack
- **Deployment**: GitHub Pages (hash routing)
