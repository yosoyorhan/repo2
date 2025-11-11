import { ArrowLeft, CreditCard, MapPin, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const MOCK_PRODUCT = {
  id: '1',
  title: 'Charizard GX Pokemon Kartı - Holografik',
  price: 450,
  image: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=300',
  seller: {
    name: 'Kart Dünyası',
    username: 'kartdunyasi'
  }
};

export function CheckoutFlow({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: ''
  });

  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const handleAddressSubmit = () => {
    if (address.fullName && address.phone && address.address && address.city) {
      setStep('payment');
    }
  };

  const handlePaymentSubmit = () => {
    if (payment.cardNumber && payment.cardName && payment.expiryDate && payment.cvv) {
      setStep('success');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-gray-900 mb-2">Siparişiniz Alındı! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Ürününüz en kısa sürede hazırlanıp kargoya verilecektir.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <ImageWithFallback 
                src={MOCK_PRODUCT.image} 
                alt={MOCK_PRODUCT.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 text-left">
                <p className="text-gray-900 text-sm">{MOCK_PRODUCT.title}</p>
                <p className="text-purple-600">₺{MOCK_PRODUCT.price.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Ürün Tutarı</span>
                <span className="text-gray-900">₺{MOCK_PRODUCT.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-600">Kargo</span>
                <span className="text-green-600">Ücretsiz</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-gray-900">Toplam</span>
                <span className="text-purple-600">₺{MOCK_PRODUCT.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg transition-all mb-3"
          >
            Ana Sayfaya Dön
          </button>
          
          <button
            onClick={() => navigate(`/profile/${currentUser.username}`)}
            className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Siparişlerimi Görüntüle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => step === 'payment' ? setStep('address') : navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-gray-900">Ödeme</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex-1 text-center ${step === 'address' || step === 'payment' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                step === 'address' || step === 'payment' ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                {step === 'payment' ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <p className="text-sm">Adres</p>
            </div>
            
            <div className={`flex-1 h-1 ${step === 'payment' ? 'bg-purple-600' : 'bg-gray-200'} -mt-6`}></div>
            
            <div className={`flex-1 text-center ${step === 'payment' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                step === 'payment' ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <p className="text-sm">Ödeme</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Forms */}
          <div className="md:col-span-2 space-y-6">
            {step === 'address' && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-6 h-6 text-purple-600" />
                  <h2 className="text-gray-900">Teslimat Adresi</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Ad Soyad *</label>
                      <input
                        type="text"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        placeholder="Ahmet Yılmaz"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Telefon *</label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="0555 123 45 67"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Adres *</label>
                    <textarea
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      placeholder="Sokak, Mahalle, Bina No, Daire No..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">İl *</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="İstanbul"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">İlçe</label>
                      <input
                        type="text"
                        value={address.district}
                        onChange={(e) => setAddress({ ...address, district: e.target.value })}
                        placeholder="Kadıköy"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Posta Kodu</label>
                      <input
                        type="text"
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        placeholder="34000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddressSubmit}
                    disabled={!address.fullName || !address.phone || !address.address || !address.city}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Devam Et
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                  <h2 className="text-gray-900">Ödeme Bilgileri</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Kart Numarası *</label>
                    <input
                      type="text"
                      value={payment.cardNumber}
                      onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Kart Üzerindeki İsim *</label>
                    <input
                      type="text"
                      value={payment.cardName}
                      onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                      placeholder="AHMET YILMAZ"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Son Kullanma Tarihi *</label>
                      <input
                        type="text"
                        value={payment.expiryDate}
                        onChange={(e) => setPayment({ ...payment, expiryDate: e.target.value })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">CVV *</label>
                      <input
                        type="text"
                        value={payment.cvv}
                        onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-900 text-sm">
                      🔒 Ödeme bilgileriniz güvenli bir şekilde işlenir. Kart bilgileriniz saklanmaz.
                    </p>
                  </div>

                  <button
                    onClick={handlePaymentSubmit}
                    disabled={!payment.cardNumber || !payment.cardName || !payment.expiryDate || !payment.cvv}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Ödemeyi Tamamla
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-md sticky top-24">
              <h3 className="text-gray-900 mb-4">Sipariş Özeti</h3>
              
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200">
                <ImageWithFallback 
                  src={MOCK_PRODUCT.image} 
                  alt={MOCK_PRODUCT.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-gray-900 text-sm mb-1">{MOCK_PRODUCT.title}</p>
                  <p className="text-gray-500 text-xs mb-2">
                    Satıcı: {MOCK_PRODUCT.seller.name}
                  </p>
                  <p className="text-purple-600">₺{MOCK_PRODUCT.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ürün Tutarı</span>
                  <span className="text-gray-900">₺{MOCK_PRODUCT.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  <span className="text-green-600">Ücretsiz</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-900">Toplam</span>
                  <span className="text-purple-600 text-xl">₺{MOCK_PRODUCT.price.toLocaleString()}</span>
                </div>
              </div>

              {step === 'address' && address.fullName && (
                <div className="bg-purple-50 rounded-xl p-4 text-sm">
                  <p className="text-purple-900 mb-1">Teslimat Adresi:</p>
                  <p className="text-purple-700">{address.fullName}</p>
                  <p className="text-purple-700 text-xs">{address.city}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
