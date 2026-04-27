import { useState, useEffect } from 'react';

export default function Appointment() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]); // YENİ: Dolu saatleri tutacak state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    serviceType: 'Saç Kesimi'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = "http://10.102.94.90:5160";


  useEffect(() => {
    const generateNext7Days = () => {
      const nextDays = [];
      const today = new Date();
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

      for (let i = 0; i < 7; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        // Zaman dilimi kaymasını önlemek için yerel tarihi string yapıyoruz
        const value = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
        const label = `${nextDate.getDate()} ${monthNames[nextDate.getMonth()]} ${dayNames[nextDate.getDay()]}`;
        nextDays.push({ value, label });
      }
      return nextDays;
    };
    const upcomingDates = generateNext7Days();
    setDates(upcomingDates);
    setSelectedDate(upcomingDates[0].value); 
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchBookedSlots = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/randevu/dolu-saatler?date=${selectedDate}`);
        if (response.ok) {
          const data = await response.json();
          setBookedSlots(data); // ["10:00", "14:30"] gibi bir liste gelir
        }
      } catch (error) {
        console.error("Dolu saatler çekilemedi:", error);
      }
    };

    fetchBookedSlots();
  }, [selectedDate]);

  const timeSlots = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length > 0 && onlyNums[0] !== '5') return;
      if (onlyNums.length > 10) return;
      setFormData({ ...formData, [name]: onlyNums });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) return alert("Telefon 10 haneli olmalı.");
    if (!selectedDate || !selectedTime) return alert("Tarih ve saat seçin!");

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/randevu/basvur`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phone,
          email: formData.email,
          serviceType: formData.serviceType,
          appointmentDate: `${selectedDate}T${selectedTime}:00`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedAppointmentId(data.appointmentId);
        setIsModalOpen(true);
      } else {
        const errorText = await response.text(); 
        alert(errorText.replace(/"/g, ''));
      }
    } catch (error) {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return alert("6 haneli kodu girin.");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/randevu/dogrula?appointmentId=${createdAppointmentId}&code=${verificationCode}`, {
        method: "POST"
      });
      if (response.ok) {
        alert("🎉 Randevunuz onaylanmıştır!");
        window.location.href = "/";
      } else {
        const errorText = await response.text();
        alert(`Hata: ${errorText}`);
      }
    } catch (error) {
      alert("Bağlantı hatası.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPastSlot = (timeStr) => {
    if (!selectedDate) return false;
    const slotDateTime = new Date(`${selectedDate}T${timeStr}:00`);
    const now = new Date();
    return slotDateTime < now;
  };

  return (
    <div className="min-h-screen bg-[#111827] py-6 px-4 flex justify-center items-center relative">
      <div className={`max-w-6xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 ${isModalOpen ? 'blur-md pointer-events-none' : ''}`}>
        <div className="bg-gray-800 text-white py-6 px-8">
          <h2 className="text-2xl font-extrabold">Randevu Oluştur</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-xl font-bold border-b pb-2">Kişisel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="firstName" placeholder="İsim" required onChange={handleInputChange} className="border p-3 rounded-xl bg-gray-50" />
                <input type="text" name="lastName" placeholder="Soyisim" required onChange={handleInputChange} className="border p-3 rounded-xl bg-gray-50" />
              </div>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 bg-gray-100 font-bold">+90</span>
                <input type="text" name="phone" value={formData.phone} required onChange={handleInputChange} placeholder="5XX XXX XX XX" className="flex-1 border p-3 rounded-r-xl bg-gray-50" />
              </div>
              <input type="email" name="email" placeholder="E-Posta" required onChange={handleInputChange} className="w-full border p-3 rounded-xl bg-gray-50" />
              <select name="serviceType" onChange={handleInputChange} className="w-full border p-3 rounded-xl bg-gray-50">
                <option value="Saç Kesimi">Saç Kesimi</option>
                <option value="Sakal Kesimi">Sakal Kesimi</option>
                <option value="Saç + Sakal">Saç + Sakal</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold border-b pb-2">Zaman Seçimi</h3>
              
              <div className="flex overflow-x-auto gap-2 pb-4 custom-scrollbar snap-x">
                {dates.map((dateObj) => (
                  <button key={dateObj.value} type="button" onClick={() => { setSelectedDate(dateObj.value); setSelectedTime(null); }}
                    className={`snap-start whitespace-nowrap py-3 px-5 rounded-xl border-2 font-bold text-sm ${selectedDate === dateObj.value ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 hover:border-gray-300"}`}>
                    {dateObj.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((time) => {
                  // YENİ: Mantık Kontrolleri
                  const isBooked = bookedSlots.includes(time); // Randevu alınmış mı?
                  const isPast = isPastSlot(time);             // Saat geçmiş mi?
                  const isDisabled = isBooked || isPast;       // Herhangi biri true ise buton iptal

                  return (
                    <button 
                      key={time} 
                      type="button" 
                      disabled={isDisabled}
                      onClick={() => setSelectedTime(time)}
                      className={`py-4 rounded-xl border-2 font-bold text-base transition-all duration-200 ${
                        isDisabled 
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-70" 
                          : selectedTime === time 
                            ? "bg-orange-500 text-white border-orange-500 scale-95 shadow-inner" 
                            : "bg-white text-gray-700 hover:border-orange-300 active:bg-gray-50"
                      }`}
                    >
                      {isDisabled ? `🚫 ${time}` : time}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white text-xl font-bold py-5 rounded-2xl mt-10 shadow-lg active:scale-[0.98] disabled:bg-gray-400">
            {isLoading ? "İşleniyor..." : "Randevuyu Onayla"}
          </button>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold text-center mb-4">E-posta Kodu</h3>
            <input type="text" maxLength="6" inputMode="numeric" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-center text-4xl tracking-widest font-black py-4 rounded-2xl border-2 mb-6 bg-gray-50 focus:border-orange-500 outline-none" />
            <button onClick={handleVerify} className="w-full bg-orange-500 py-4 rounded-2xl text-white font-bold active:scale-95 transition-transform">Kodu Doğrula</button>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 text-sm text-gray-400">İptal</button>
          </div>
        </div>
      )}
    </div>
  );
}