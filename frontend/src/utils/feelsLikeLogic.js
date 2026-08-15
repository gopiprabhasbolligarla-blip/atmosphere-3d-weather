/**
 * Rule-based "Feels Like" Reasoning Generator
 * Explains WHY the apparent temperature differs from the actual temperature.
 */

export const getFeelsLikeReasoning = (tempC, apparentTempC, humidity, windKmH, uvIndex = 0) => {
  const diff = apparentTempC - tempC;

  if (Math.abs(diff) < 1.0) {
    if (humidity > 70) {
      return "Feels accurate, with high humidity keeping conditions pleasant.";
    }
    if (windKmH > 20) {
      return "Feels true to actual temperature despite a slight breeze.";
    }
    return "Feels identical to the actual temperature.";
  }

  // Warmer than actual temp
  if (diff >= 1.0) {
    if (humidity >= 75) {
      return `Feels ${Math.round(diff)}° warmer due to high humidity (${humidity}%) trapping body heat.`;
    }
    if (uvIndex >= 7) {
      return `Feels ${Math.round(diff)}° warmer under intense direct solar radiation (UV ${uvIndex}).`;
    }
    return `Feels ${Math.round(diff)}° warmer due to moisture and solar heat absorption.`;
  }

  // Colder than actual temp
  if (diff <= -1.0) {
    const absDiff = Math.abs(Math.round(diff));
    if (windKmH >= 25) {
      return `Feels ${absDiff}° colder due to strong wind chill from ${Math.round(windKmH)} km/h gusts.`;
    }
    if (windKmH >= 12) {
      return `Feels ${absDiff}° cooler due to a brisk ${Math.round(windKmH)} km/h wind.`;
    }
    if (tempC < 10) {
      return `Feels ${absDiff}° colder due to frigid ambient air moisture.`;
    }
    return `Feels ${absDiff}° cooler due to wind movement and lower humidity.`;
  }

  return "Feels consistent with local atmospheric conditions.";
};
