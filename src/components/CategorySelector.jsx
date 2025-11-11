import React from 'react';

const CATEGORIES = {
  'Teknoloji ve Elektronik': [
    'Cep Telefonu ve Aksesuarları',
    'Bilgisayar ve Tablet',
    'TV, Ses ve Görüntü Sistemleri',
    'Kamera ve Drone',
    'Oyun Konsolları ve Aksesuarları',
    'Akıllı Saat ve Giyilebilir Teknoloji',
    'Diğer Elektronik Ürünler'
  ],
  'Moda ve Giyim': [
    'Kadın Giyim',
    'Erkek Giyim',
    'Çocuk Giyim',
    'Ayakkabı',
    'Çanta ve Cüzdan',
    'Aksesuar (Şapka, Kemer, Eşarp vb.)',
    'Takı ve Saat',
    'İç Giyim'
  ],
  'Ev ve Yaşam': [
    'Mobilya',
    'Ev Tekstili',
    'Mutfak Gereçleri',
    'Banyo Ürünleri',
    'Ev Dekorasyonu',
    'Aydınlatma',
    'Bahçe ve Dış Mekan',
    'Ev Aletleri (Elektrikli Süpürge, Ütü vb.)'
  ],
  'Anne, Bebek ve Çocuk': [
    'Bebek Giyim',
    'Bebek Bakım Ürünleri',
    'Bebek Araç Gereçleri (Bebek Arabası, Puset vb.)',
    'Oyuncak',
    'Bebek Odası ve Mobilya',
    'Emzirme ve Beslenme',
    'Çocuk Güvenlik Ürünleri'
  ],
  'Spor ve Outdoor': [
    'Spor Giyim',
    'Spor Ayakkabı',
    'Fitness Ekipmanları',
    'Kamp ve Outdoor Malzemeleri',
    'Bisiklet ve Scooter',
    'Su Sporları',
    'Diğer Spor Ekipmanları'
  ],
  'Kitap, Müzik, Film, Hobi': [
    'Kitap',
    'Müzik Enstrümanları',
    'Film ve Dizi (DVD, Blu-ray)',
    'Hobi Malzemeleri (Resim, El İşi vb.)',
    'Koleksiyon Ürünleri',
    'Müzik Medyası'
  ],
  'Kozmetik ve Kişisel Bakım': [
    'Makyaj Ürünleri',
    'Cilt Bakım Ürünleri',
    'Saç Bakım Ürünleri',
    'Parfüm ve Deodorant',
    'Tıraş ve Epilasyon',
    'Ağız ve Diş Bakımı',
    'Vücut Bakım Ürünleri'
  ],
  'Süpermarket ve Pet Shop': [
    'Gıda Ürünleri',
    'İçecekler',
    'Temizlik Ürünleri',
    'Kağıt Ürünleri',
    'Kedi Ürünleri',
    'Köpek Ürünleri',
    'Diğer Evcil Hayvan Ürünleri'
  ],
  'Otomotiv ve Motosiklet': [
    'Oto Aksesuar',
    'Oto Yedek Parça',
    'Oto Bakım Ürünleri',
    'Motosiklet Aksesuar',
    'Motosiklet Yedek Parça',
    'Lastik',
    'Araç Elektroniği (Teyp, Navigasyon vb.)'
  ],
  'Yapı Market': [
    'El Aletleri',
    'Elektrikli El Aletleri',
    'Hırdavat',
    'Boya ve Yapı Malzemeleri',
    'Elektrik ve Aydınlatma',
    'Nalburiye',
    'Bahçe Ekipmanları'
  ],
  'Ofis ve Kırtasiye': [
    'Ofis Mobilyaları',
    'Yazı ve Çizim Gereçleri',
    'Dosyalama ve Arşivleme',
    'Ofis Elektroniği',
    'Kağıt Ürünleri',
    'Organizasyon ve Planlama',
    'Diğer Kırtasiye'
  ],
  'Sağlık': [
    'Medikal Cihazlar',
    'Vitamin ve Takviyeler',
    'Tıbbi Malzemeler',
    'Ortopedik Ürünler',
    'İlk Yardım',
    'Diğer Sağlık Ürünleri'
  ],
  'Sanat ve Zanaat': [
    'Resim Malzemeleri',
    'El Sanatları',
    'Dikiş ve Nakış',
    'Model ve Maket',
    'Origami ve Kağıt Sanatları',
    'Diğer Sanat Malzemeleri'
  ],
  'Gıda ve İçecek': [
    'Tatlı ve Şeker',
    'Organik Ürünler',
    'Kuruyemiş',
    'Baharat ve Çeşni',
    'Kahve ve Çay',
    'Diğer Gıda Ürünleri'
  ],
  'Hediyelik Eşya': [
    'Doğum Günü Hediyeleri',
    'Düğün ve Nişan Hediyeleri',
    'Yıldönümü Hediyeleri',
    'Özel Gün Hediyeleri',
    'Hediyelik Setler',
    'Diğer Hediyelikler'
  ]
};

export default function CategorySelector({ value, onChange, className }) {
  const [mainCategory, subCategory] = value ? value.split(' > ') : ['', ''];

  const handleMainCategoryChange = (e) => {
    const main = e.target.value;
    onChange(main);
  };

  const handleSubCategoryChange = (e) => {
    const sub = e.target.value;
    if (mainCategory && sub) {
      onChange(`${mainCategory} > ${sub}`);
    }
  };

  const subCategories = mainCategory ? CATEGORIES[mainCategory] || [] : [];

  return (
    <div className={className}>
      <div className="space-y-3">
        {/* Ana Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1.5">
            Ana Kategori
          </label>
          <select
            value={mainCategory}
            onChange={handleMainCategoryChange}
            className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            required
          >
            <option value="">Kategori Seçin</option>
            {Object.keys(CATEGORIES).map((cat) => (
              <option key={cat} value={cat} className="bg-gray-900">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Alt Kategori */}
        {mainCategory && (
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1.5">
              Alt Kategori
            </label>
            <select
              value={subCategory}
              onChange={handleSubCategoryChange}
              className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
            >
              <option value="">Alt Kategori Seçin</option>
              {subCategories.map((subCat) => (
                <option key={subCat} value={subCat} className="bg-gray-900">
                  {subCat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Seçili Kategori Gösterimi */}
        {value && (
          <div className="px-3 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <p className="text-sm text-blue-200">
              <span className="font-medium">Seçili:</span> {value}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
