export function calculateDryingScore(forecastList) {
  const next6Hours = forecastList.slice(0, 2);
  
  let rainImminent = false;
  let totalScore = 0;

  // Variables to hold our averages
  let avgTemp = 0, avgHumidity = 0, avgWind = 0, avgClouds = 0;

  next6Hours.forEach(block => {
    if (block.pop > 0.3 || (block.rain && block.rain['3h'] > 0)) rainImminent = true;

    const temp = block.main.temp;
    const humidity = block.main.humidity;
    const wind_speed = block.wind.speed;

    // Add to averages
    avgTemp += temp;
    avgHumidity += humidity;
    avgWind += wind_speed;
    avgClouds += block.clouds.all;

    // Scoring logic
    let blockScore = 100;
    if (humidity > 50) blockScore -= (humidity - 50) * 0.8; 
    if (wind_speed > 3) blockScore += (wind_speed - 3) * 2;
    else if (wind_speed < 1) blockScore -= 10; 
    if (temp > 25) blockScore += (temp - 25) * 1.5;
    else if (temp < 15) blockScore -= (15 - temp) * 1.5;

    totalScore += Math.min(Math.max(blockScore, 0), 100);
  });

  // Finalize averages
  const conditions = [
    { label: 'Temp', value: `${Math.round(avgTemp / 2)}°C`, icon: '🌡️' },
    { label: 'Humidity', value: `${Math.round(avgHumidity / 2)}%`, icon: '💧' },
    { label: 'Wind', value: `${(avgWind / 2).toFixed(1)} m/s`, icon: '🌬️' },
    { label: 'Clouds', value: `${Math.round(avgClouds / 2)}%`, icon: '☁️' }
  ];

  const averageScore = totalScore / 2;

  // Return the score AND the exact conditions
  if (rainImminent) {
    return { status: 'bad', score: 0, title: 'No, Keep Them Inside 🌧️', message: 'Rain is expected in the next few hours.', bg: 'bg-red-500', conditions };
  } else if (averageScore >= 75) {
    return { status: 'excellent', score: averageScore, title: 'Yes, Perfect Weather! ☀️', message: 'High wind and low humidity. They will dry fast.', bg: 'bg-green-500', conditions };
  } else if (averageScore >= 50) {
    return { status: 'good', score: averageScore, title: 'Yes, Hang Them 🌤️', message: 'Decent drying conditions. It might take a few hours.', bg: 'bg-emerald-400', conditions };
  } else {
    return { status: 'poor', score: averageScore, title: 'Maybe Not ☁️', message: 'Too humid or still. They will stay damp all day.', bg: 'bg-orange-400', conditions };
  }
}