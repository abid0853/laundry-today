import { useState, useEffect } from 'react';
import { MapPin, Loader2, CloudSun, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function WillItDry() {
  const [uiState, setUiState] = useState('idle'); // idle, loading, success, error
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
      (err) => {
        setErrorMsg("Please allow location access to check your local sky.");
        setUiState('error');
      },
      { timeout: 10000, maximumAge: 60000 } // Optimized GPS fetching
    );
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-700 ease-in-out ${result ? result.bg : 'bg-slate-50'}`}>
      
      <main className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-8 text-center transform transition-all hover:scale-[1.01]">
        
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
          <div className="py-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
            <div className="inline-block px-4 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-sm mb-6 tracking-wide uppercase">
              Drying Score: {Math.round(result.score)}/100
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 leading-tight">{result.title}</h2>
            <p className="text-xl text-slate-600 font-medium mb-10">{result.message}</p>
            
            <button 
              onClick={() => { setResult(null); setUiState('idle'); }}
              className="group flex items-center justify-center mx-auto text-slate-400 hover:text-slate-700 font-semibold transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Check again later
            </button>
          </div>
        )}
      </main>

      {/* Sponsor Banner - Hidden on success to keep UI clean, visible on idle */}
      {uiState !== 'success' && (
        <div className="mt-8 px-6 py-3 rounded-full bg-white/50 backdrop-blur-sm text-sm font-semibold text-slate-500 shadow-sm border border-black/5">
          Sponsored by <span className="text-slate-800">[Your Local Laundry/Bakery Here]</span>
        </div>
      )}
    </div>
  );
}