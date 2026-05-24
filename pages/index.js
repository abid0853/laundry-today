import { useState, useEffect } from 'react';
import { MapPin, Loader2, CloudSun, RefreshCw, Search } from 'lucide-react';
import axios from 'axios';

export default function WillItDry() {
  const [uiState, setUiState] = useState('idle'); 
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  // New Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced Search Effect: Waits 500ms after user stops typing before calling API
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        try {
          const res = await axios.get(`/api/search?q=${searchQuery}`);
          setSuggestions(res.data);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Reusable function to fetch weather data from either GPS or Search
  const fetchWeatherData = async (lat, lon) => {
    setUiState('loading');
    setErrorMsg("");
    setSuggestions([]); // Close dropdown
    setSearchQuery(""); // Clear search bar

    try {
      const res = await axios.post('/api/weather', { lat, lon });
      setResult(res.data);
      setUiState('success');
    } catch (err) {
      setErrorMsg("Could not connect to the weather grid.");
      setUiState('error');
    }
  };

  const checkGPSLocation = () => {
    setUiState('loading');
    if (!navigator.geolocation) {
      setErrorMsg("Your browser doesn't support geolocation.");
      setUiState('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => fetchWeatherData(position.coords.latitude, position.coords.longitude), 
      () => {
        setErrorMsg("Please allow location access, or use the search bar below.");
        setUiState('error');
      },
      { timeout: 10000, maximumAge: 60000 } 
    );
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-700 ease-in-out ${result ? result.bg : 'bg-slate-50'}`}>
      
      <main className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-8 text-center transform transition-all relative z-20">
        
        {uiState === 'idle' || uiState === 'error' ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <CloudSun className="w-28 h-28 mx-auto text-sky-400 mb-6 drop-shadow-md" />
            <h1 className="text-4xl font-black tracking-tight mb-3">
              <span className="text-slate-800">Laun</span>
              <span className="text-sky-500">Dry</span>
              <span className="text-slate-800"> Today</span>
            </h1>
            <p className="text-slate-500 mb-8 font-medium leading-relaxed">
              Stop guessing. Get an instant answer based on wind and humidity.
            </p>
            
            {/* GPS Button */}
            <button 
              onClick={checkGPSLocation}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 mb-6"
            >
              <MapPin className="w-5 h-5 mr-3" />
              <span className="text-lg">Use My Location</span>
            </button>

            <div className="flex items-center text-slate-400 text-sm font-semibold mb-6">
              <div className="flex-1 border-b border-slate-200"></div>
              <span className="px-3">OR</span>
              <div className="flex-1 border-b border-slate-200"></div>
            </div>

            {/* Search Input */}
            <div className="relative text-left">
              <div className="flex items-center bg-slate-100 rounded-xl px-4 py-3 border border-transparent focus-within:border-sky-400 focus-within:bg-white transition-all shadow-inner">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <input 
                  type="text"
                  placeholder="Search for a city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none placeholder:text-slate-400 placeholder:font-medium"
                />
                {isSearching && <Loader2 className="w-4 h-4 text-sky-400 animate-spin ml-2" />}
              </div>

              {/* Dropdown Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  {suggestions.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => fetchWeatherData(city.lat, city.lon)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors border-b last:border-b-0 border-slate-100 flex items-center"
                    >
                      <MapPin className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                      <span className="text-slate-700 font-semibold truncate">{city.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
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