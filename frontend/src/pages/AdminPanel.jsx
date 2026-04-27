import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa yüklendiğinde tüm randevuları çek
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // PORTUNU KONTROL ETMEYİ UNUTMA
      const response = await fetch("http://10.102.94.90:5160/api/admin/randevular");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Randevular çekilirken hata oluştu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Randevu İptal Etme (Silme) Fonksiyonu
  const handleDelete = async (id) => {
    if (!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(`http://10.102.94.90:5160/api/randevu/sil/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setAppointments(appointments.filter(app => app.id !== id));
        alert("Randevu başarıyla silindi.");
      }
    } catch (error) {
      alert("Silme işlemi sırasında hata oluştu.");
    }
  };

  // Numarayı Engelleme Fonksiyonu
  const handleBlock = async (phone) => {
    if (!window.confirm(`DİKKAT: ${phone} numaralı müşteriyi engellemek istediğinize emin misiniz? Bu işlem müşterinin mevcut tüm randevularını da silecektir!`)) return;

    try {
      const response = await fetch(`http://10.102.94.90:5160/api/admin/engelle?phone=${phone}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert("Numara başarıyla engellendi ve mevcut randevuları temizlendi.");
        // Listeyi yenile (Silinen randevuların ekrandan gitmesi için)
        fetchAppointments();
      }
    } catch (error) {
      alert("Engelleme işlemi sırasında hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Üst Bilgi Alanı */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Yönetim Paneli</h1>
            <p className="text-gray-400 mt-1">Sistemdeki tüm aktif randevuları buradan yönetebilirsiniz.</p>
          </div>
          <Link to="/" className="mt-4 sm:mt-0 bg-white text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors">
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Yükleniyor veya Boş Durumu */}
        {isLoading ? (
          <div className="text-center text-xl font-semibold text-gray-600 mt-20">Yükleniyor...</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <h3 className="text-2xl font-bold text-gray-700">Şu an hiç randevu yok.</h3>
            <p className="text-gray-500 mt-2">Yeni randevular geldikçe burada listelenecektir.</p>
          </div>
        ) : (
          /* Randevu Kartları Grid Yapısı */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {appointments.map((app) => {
              const dateObj = new Date(app.appointmentDate);
              return (
                <div key={app.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Kart Üst (Tarih ve Durum) */}
                  <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex justify-between items-center">
                    <span className="font-bold text-orange-600 text-lg">
                      {dateObj.toLocaleDateString('tr-TR')} - {dateObj.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === 'Onaylandı' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {app.status}
                    </span>
                  </div>
                  
                  {/* Kart Orta (Bilgiler) */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Müşteri:</span>
                      <span className="font-bold text-gray-800 text-lg">{app.firstName} {app.lastName}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Telefon:</span>
                      <span className="font-semibold text-gray-800">0{app.phoneNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">İşlem:</span>
                      <span className="font-semibold text-gray-800">{app.serviceType}</span>
                    </div>
                    <div className="flex flex-col mt-2">
                      <span className="text-gray-400 text-sm">E-Posta:</span>
                      <span className="text-gray-600 text-sm truncate">{app.email}</span>
                    </div>
                  </div>

                  {/* Kart Alt (Aksiyon Butonları) */}
                  <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-3">
                    <button 
                      onClick={() => handleDelete(app.id)}
                      className="flex-1 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white font-bold py-2 rounded-lg transition-colors"
                    >
                      İptal Et
                    </button>
                    <button 
                      onClick={() => handleBlock(app.phoneNumber)}
                      className="flex-1 bg-gray-800 text-white hover:bg-black font-bold py-2 rounded-lg transition-colors text-sm"
                    >
                      Numarayı Engelle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}