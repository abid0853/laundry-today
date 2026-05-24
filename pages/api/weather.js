import axios from 'axios';
import { calculateDryingScore } from '../../utils/dryingAlgorithm';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Round coordinates to 2 decimal places (approx 1.1km accuracy). 
  // This drastically increases cache hit rates for users in the same neighborhood!
  const lat = parseFloat(req.body.lat).toFixed(2);
  const lon = parseFloat(req.body.lon).toFixed(2);
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${API_KEY}`;
    
    const response = await axios.get(url);
    const result = calculateDryingScore(response.data.hourly);
    
    // VERCEL MAGIC: Cache this response on the Edge Network for 30 minutes (1800 seconds)
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    res.status(200).json(result);

  } catch (error) {
    console.error("Weather API Error:", error.message);
    res.status(500).json({ error: 'Failed to fetch local weather data' });
  }
}