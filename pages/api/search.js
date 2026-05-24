import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { q } = req.query;
  
  if (!q || q.length < 3) {
    return res.status(200).json([]);
  }

  const API_KEY = process.env.OPENWEATHER_API_KEY;

  try {
    // OpenWeather Geocoding API (Limit 5 results)
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${API_KEY}`;
    
    const response = await axios.get(url);
    
    // Format the response to be clean for the frontend
    const suggestions = response.data.map(item => ({
      name: item.name,
      state: item.state,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      // Create a unique display label (e.g., "Kochi, Kerala, IN")
      label: `${item.name}${item.state ? `, ${item.state}` : ''}, ${item.country}`
    }));

    // Cache the search results so common searches load instantly
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json(suggestions);

  } catch (error) {
    console.error("Geocoding API Error:", error.message);
    res.status(500).json({ error: 'Failed to search locations' });
  }
}