import axios from 'axios';
import { calculateDryingScore } from '../../utils/dryingAlgorithm';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const lat = parseFloat(req.body.lat).toFixed(2);
  const lon = parseFloat(req.body.lon).toFixed(2);
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await axios.get(url);
    
    // 1. Calculate the score
    const result = calculateDryingScore(response.data.list);
    
    // 2. Attach the exact city name provided by the API
    result.location = response.data.city.name; 
    
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    res.status(200).json(result);

  } catch (error) {
    console.error("Weather API Error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch local weather data' });
  }
}