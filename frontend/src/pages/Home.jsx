import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed relative flex flex-col">
      
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-8 text-center mt-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">Premium Erkek Kuaförü</h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-10 drop-shadow-md">
          Yılların getirdiği tecrübe ile saç ve sakal tasarımında modern dokunuşlar sunuyoruz. 
          Profesyonel ekibimizle kendinizi yenilenmiş hissedeceksiniz.
        </p>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md text-left text-white">
          <h2 className="text-2xl font-semibold mb-6 border-b border-white/30 pb-3 text-center">İletişim & Adres</h2>
          <p className="mb-4 text-lg"><strong className="text-orange-400">📍 Adres:</strong> Merkez Mahallesi, Kuaför Sokak No:1</p>
          <p className="mb-4 text-lg"><strong className="text-orange-400">📞 Telefon:</strong> +90 555 123 45 67</p>
          <p className="text-lg"><strong className="text-orange-400">🕒 Çalışma Saatleri:</strong> 10:00 - 18:00</p>
        </div>
      </div>

      <div className="relative z-10 pb-16 pt-4 flex flex-col sm:flex-row items-center justify-center gap-6 px-4">
        <Link 
          to="/randevu" 
          className="bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold py-4 px-10 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-transform transform hover:scale-105 text-center whitespace-nowrap"
        >
          Randevu Başvur
        </Link>
        
        <Link 
          to="/randevularim" 
          className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 hover:bg-gray-900 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg transition-transform transform hover:scale-105 text-center whitespace-nowrap"
        >
          Randevularım / İptal
        </Link>
      </div>

    </div>
  );
}