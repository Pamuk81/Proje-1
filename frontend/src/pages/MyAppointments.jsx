import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function MyAppointments() {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // NOT: Buradaki 10.102.94.90 yerine Hamachi IP'ni yazmayı unutma!
  const API_BASE = "http://10.102.94.90:5160"; 

  const handleSearch = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      alert("Lütfen 10 haneli telefon numaranızı başında 0 olmadan girin.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/randevu/listele?phone=${phone}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
        setHasSearched(true);
      }
    } catch (error) {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/randevu/sil/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert("Randevunuz başarıyla iptal edildi.");
        setAppointments(appointments.filter(app => app.id !== id));
      }
    } catch (error) {
      alert("İptal işlemi sırasında hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] py-8 px-4 sm:px-6 lg:py-12 flex flex-col items-center">
      
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden">
        
        {/* Üst Başlık Alanı */}
        <div className="bg-gray-800 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Randevularım</h2>
          <Link to="/" className="text-orange-400 hover:text-orange-500 font-bold transition-colors text-sm sm:text-base">
            ← Ana Sayfaya Dön
          </Link>
        </div>

        <div className="p-6 sm:p-8">
          {/* Sorgulama Formu */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10">
            <div className="flex-1 flex">
              <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-gray-300 bg-gray-100 text-gray-600 font-bold">
                +90
              </span>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="5XX XXX XX XX"
                maxLength="10"
                inputMode="numeric"
                className="flex-1 block w-full rounded-none rounded-r-2xl border-gray-300 shadow-sm border p-4 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-lg" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-gray-800 text-white font-bold py-4 px-8 rounded-2xl hover:bg-gray-700 active:scale-95 transition-all shadow-lg disabled:bg-gray-400"
            >
              {isLoading ? "Aranıyor..." : "Sorgula"}
            </button>
          </form>

          {/* Arama Sonucu Yoksa */}
          {hasSearched && appointments.length === 0 && (
            <div className="text-center p-10 bg-orange-50 border-2 border-dashed border-orange-200 text-orange-700 rounded-3xl">
              <p className="text-lg font-semibold">Aktif randevu bulunamadı.</p>
              <p className="text-sm mt-1">Numaranızı doğru girdiğinizden emin olun.</p>
            </div>
          )}

          {/* Randevu Listesi */}
          <div className="space-y-4">
            {appointments.map((app) => {
              const dateObj = new Date(app.appointmentDate);
              return (
                <div key={app.id} className="group relative bg-white border-2 border-gray-100 p-5 rounded-2xl shadow-sm hover:border-orange-200 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-700 text-xs font-black px-2 py-1 rounded uppercase">
                          {app.serviceType}
                        </span>
                      </div>
                      <h3 className="font-black text-xl text-gray-800 capitalize">
                        {app.firstName} {app.lastName}
                      </h3>
                      <div className="flex flex-col text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          🗓️ {dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                        </span>
                        <span className="flex items-center gap-1 text-orange-600 font-bold">
                          🕒 {dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleCancel(app.id)}
                      className="w-full sm:w-auto bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 font-bold py-3 px-8 rounded-xl transition-all active:scale-95"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alt Bilgi */}
      <p className="mt-8 text-gray-500 text-sm">
        Premium Kuaför © 2026 - Tüm Hakları Saklıdır.
      </p>
    </div>
  );
}