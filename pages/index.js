import { useState } from 'react';
import { MapPin, Loader2, CloudSun, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function WillItDry() {
  const [uiState, setUiState] = useState('idle'); 
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const checkWeather = () => {
    setUiState('loading');

    if (!navigator.geolocation) {
      setErrorMsg("Your browser doesn't support geolocation.");
      setUiState('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await axios.post('/api/weather', { 
            lat: position.coords.latitude, 
            lon: position.coords.longitude 
          });
          setResult(res.data);
          setUiState('success');
        } catch (err) {
          setErrorMsg("Could not connect to the weather grid.");
          setUiState('error');
        }
      }, 
      () => {
        setErrorMsg("Please allow location access to check your local sky.");
        setUiState('error');
      },
      { timeout: 10000, maximumAge: 60000 } 
    );
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-700 ease-in-out ${result ? result.bg : 'bg-slate-50'}`}>
      
      <main className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-8 text-center transform transition-all">
        
        {uiState === 'idle' || uiState === 'error' ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <CloudSun className="w-28 h-28 mx-auto text-sky-400 mb-6 drop-shadow-md" />
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Will It Dry?</h1>
            <p className="text-slate-500 mb-10 font-medium leading-relaxed">
              Stop guessing. Get an instant, hyper-local answer based on wind and humidity.
            </p>
            
            <button 
              onClick={checkWeather}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 px-8 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <MapPin className="w-6 h-6 mr-3" />
              <span className="text-lg">Check My Location</span>
            </button>
            
            {uiState === 'error' && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">
                {errorMsg}
              </div>
            )}
          </div>
        ) : uiState === 'loading' ? (
          <div className="py-12 flex flex-col items-center justify-center animate-pulse">
            <Loader2 className="w-16 h-16 text-sky-500 animate-spin mb-6" />
            <p className="text-slate-500 font-medium text-lg">Analyzing local wind patterns...</p>
          </div>
        ) : (
          <div className="py-2 animate-in slide-in-from-bottom-8 fade-in duration-700">
            
            {/* Dynamic Location Header */}
            {/* Dynamic Location Header */}
<div className="flex flex-col items-center justify-center mb-8">
  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1.5">
    <MapPin className="w-3.5 h-3.5" />
    Nearest Weather Station
  </div>
  <div className="text-slate-600 font-bold text-sm tracking-wide bg-slate-200/50 border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
    {result.location || "Regional Grid"}
  </div>
</div>

            <h2 className="text-4xl font-black text-slate-900 mb-2 leading-tight">{result.title}</h2>
            <p className="text-lg text-slate-600 font-medium mb-8">{result.message}</p>
            
            {/* The "Reasons" Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {result.conditions.map((item, index) => (
                <div key={index} className="bg-slate-100/80 rounded-xl p-3 flex flex-col items-center border border-slate-200 shadow-sm">
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{item.label}</span>
                  <span className="text-lg font-black text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => { setResult(null); setUiState('idle'); }}
              className="group flex items-center justify-center mx-auto text-slate-400 hover:text-slate-700 font-semibold transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Check another location
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="mt-10 mb-4 text-center text-sm font-semibold text-slate-400 z-10 relative">
        Developed by{' '}
        <a 
          href="https://github.com/abid0853" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-sky-500 transition-colors underline underline-offset-4"
        >
          Abid TS
        </a>
      </div>
      
    </div>
  );
}