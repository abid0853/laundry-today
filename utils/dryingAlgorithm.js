export function calculateDryingScore(hourlyData) {
  const next4Hours = hourlyData.slice(0, 4);
  
  let rainImminent = false;
  let totalScore = 0;

  next4Hours.forEach(hour => {
    // 1. Immediate Failure Checks
    if (hour.pop > 0.3 || (hour.rain && hour.rain['1h'] > 0)) {
      rainImminent = true;
    }

    // 2. Base Score Calculation per hour (out of 100)
    let hourScore = 100;

    // Humidity Penalty (Ideal is < 50%, harsh penalty above 80%)
    if (hour.humidity > 50) {
      hourScore -= (hour.humidity - 50) * 0.8; 
    }

    // Wind Bonus (Ideal is > 3 m/s)
    if (hour.wind_speed > 3) {
      hourScore += (hour.wind_speed - 3) * 2;
    } else if (hour.wind_speed < 1) {
      hourScore -= 10; // Stagnant air penalty
    }

    // Temperature Adjustment (Bonus for hot, penalty for cold)
    if (hour.temp > 25) {
      hourScore += (hour.temp - 25) * 1.5;
    } else if (hour.temp < 15) {
      hourScore -= (15 - hour.temp) * 1.5;
    }

    // Cap the hour score at 100
    totalScore += Math.min(Math.max(hourScore, 0), 100);
  });

  if (rainImminent) {
    return { status: 'bad', score: 0, title: 'No, Keep Them Inside 🌧️', message: 'Rain is expected in the next 4 hours.', bg: 'bg-red-500' };
  }

  const averageScore = totalScore / 4;

  if (averageScore >= 75) {
    return { status: 'excellent', score: averageScore, title: 'Yes, Perfect Weather! ☀️', message: 'High wind and low humidity. They will dry fast.', bg: 'bg-green-500' };
  } else if (averageScore >= 50) {
    return { status: 'good', score: averageScore, title: 'Yes, Hang Them 🌤️', message: 'Decent drying conditions. It might take a few hours.', bg: 'bg-emerald-400' };
  } else {
    return { status: 'poor', score: averageScore, title: 'Maybe Not ☁️', message: 'Too humid or still. They will stay damp all day.', bg: 'bg-orange-400' };
  }
}