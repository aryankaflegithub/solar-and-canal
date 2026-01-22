import { useState, useEffect, useCallback, useRef } from 'react';

export interface TelemetryData {
  powerOutputKw: number;
  temperaturePanel: number;
  temperatureAmbient: number;
  humidityPercent: number;
  solarIrradiance: number;
  waterTemp: number;
  siltLevel: number;
  timestamp: Date;
}

export interface DerivedMetrics {
  waterSavedLiters: number;
  efficiencyDelta: number;
  totalEnergyKwh: number;
  co2OffsetKg: number;
  panelCoolingBenefit: number;
}

// Penman-Monteith evaporation estimation (simplified for canal)
function calculateEvaporationRate(
  temperature: number,
  humidity: number,
  shadedArea: number
): number {
  // Constants for Penman-Monteith
  const gamma = 0.066; // Psychrometric constant (kPa/°C)
  const Rn = 0.0864 * 500; // Net radiation (MJ/m²/day) simplified
  const G = 0; // Soil heat flux (negligible for water)
  const u2 = 2; // Wind speed at 2m (m/s)
  
  // Saturation vapor pressure
  const es = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
  // Actual vapor pressure
  const ea = es * (humidity / 100);
  // Slope of saturation vapor pressure curve
  const delta = (4098 * es) / Math.pow(temperature + 237.3, 2);
  
  // Penman-Monteith equation (mm/day)
  const ET0 = (0.408 * delta * (Rn - G) + gamma * (900 / (temperature + 273)) * u2 * (es - ea)) /
              (delta + gamma * (1 + 0.34 * u2));
  
  // Reduction factor for shading (panels block 85% of evaporation)
  const shadingFactor = 0.85;
  
  // Convert to liters/hour for shadedArea (m²)
  // 1mm over 1m² = 1 liter
  const waterSavedPerHour = (ET0 / 24) * shadedArea * shadingFactor;
  
  return waterSavedPerHour;
}

// Calculate efficiency gain from cooler panel temperature
function calculateEfficiencyDelta(panelTemp: number, waterTemp: number): number {
  // Standard test conditions: 25°C
  // Temperature coefficient for crystalline silicon: -0.4% to -0.5% per °C
  const tempCoefficient = -0.0045;
  const stcTemp = 25;
  
  // Without water cooling, panels would be ~30°C hotter
  const expectedPanelTempWithoutCooling = panelTemp + 30;
  
  // Efficiency loss at current temp vs expected temp without cooling
  const efficiencyLossWithCooling = tempCoefficient * (panelTemp - stcTemp) * 100;
  const efficiencyLossWithoutCooling = tempCoefficient * (expectedPanelTempWithoutCooling - stcTemp) * 100;
  
  // Delta is the efficiency saved
  const delta = efficiencyLossWithoutCooling - efficiencyLossWithCooling;
  
  return Math.abs(delta);
}

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    powerOutputKw: 0,
    temperaturePanel: 35,
    temperatureAmbient: 28,
    humidityPercent: 65,
    solarIrradiance: 850,
    waterTemp: 24,
    siltLevel: 15,
    timestamp: new Date(),
  });

  const [metrics, setMetrics] = useState<DerivedMetrics>({
    waterSavedLiters: 0,
    efficiencyDelta: 0,
    totalEnergyKwh: 0,
    co2OffsetKg: 0,
    panelCoolingBenefit: 0,
  });

  const [historicalData, setHistoricalData] = useState<TelemetryData[]>([]);
  
  // Ring buffer for throttling updates
  const bufferRef = useRef<TelemetryData[]>([]);
  const cumulativeWaterRef = useRef(0);
  const cumulativeEnergyRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());
  const lastDataRef = useRef<TelemetryData | null>(null);

  // Smooth data using exponential moving average for natural transitions
  const smoothData = useCallback((newData: TelemetryData, lastData: TelemetryData | null) => {
    if (!lastData) return newData;

    // Exponential moving average with smoothing factor
    const alpha = 0.3; // 0.3 = 30% new data, 70% previous (higher = more responsive)

    return {
      ...newData,
      powerOutputKw: lastData.powerOutputKw + alpha * (newData.powerOutputKw - lastData.powerOutputKw),
      temperaturePanel: lastData.temperaturePanel + alpha * (newData.temperaturePanel - lastData.temperaturePanel),
      temperatureAmbient: lastData.temperatureAmbient + alpha * (newData.temperatureAmbient - lastData.temperatureAmbient),
      humidityPercent: Math.min(100, Math.max(30, lastData.humidityPercent + alpha * (newData.humidityPercent - lastData.humidityPercent))),
      solarIrradiance: Math.max(0, lastData.solarIrradiance + alpha * (newData.solarIrradiance - lastData.solarIrradiance)),
      waterTemp: Math.max(15, lastData.waterTemp + alpha * (newData.waterTemp - lastData.waterTemp)),
      siltLevel: Math.min(100, Math.max(0, lastData.siltLevel + alpha * (newData.siltLevel - lastData.siltLevel))),
      timestamp: newData.timestamp,
    };
  }, []);

  // Simulated MQTT data generation (replace with actual MQTT connection)
  const generateSimulatedData = useCallback(() => {
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour <= 18;
    
    // Solar irradiance follows a bell curve during day
    const solarPeak = 1000;
    const solarBase = isDaytime 
      ? solarPeak * Math.sin(((hour - 6) / 12) * Math.PI)
      : 0;
    const solarIrradiance = Math.max(0, solarBase + (Math.random() - 0.5) * 100);
    
    // Power output correlates with irradiance
    const systemCapacity = 250; // kW
    const efficiency = 0.18 + Math.random() * 0.03;
    const powerOutputKw = (solarIrradiance / 1000) * systemCapacity * efficiency;
    
    // Temperature with some variation
    const baseAmbient = 25 + Math.sin(((hour - 6) / 12) * Math.PI) * 8;
    const temperatureAmbient = baseAmbient + (Math.random() - 0.5) * 3;
    const temperaturePanel = temperatureAmbient + 10 + solarIrradiance * 0.015;
    
    // Humidity inversely related to temperature
    const humidityPercent = 80 - temperatureAmbient + (Math.random() - 0.5) * 10;
    
    // Water temperature more stable
    const waterTemp = 22 + Math.sin(((hour - 6) / 12) * Math.PI) * 4;
    
    // Silt level with occasional spikes
    const siltLevel = 10 + Math.random() * 20 + (Math.random() > 0.95 ? 30 : 0);

    return {
      powerOutputKw: Math.max(0, powerOutputKw),
      temperaturePanel: Math.max(20, temperaturePanel),
      temperatureAmbient: Math.max(15, temperatureAmbient),
      humidityPercent: Math.min(100, Math.max(30, humidityPercent)),
      solarIrradiance: Math.max(0, solarIrradiance),
      waterTemp: Math.max(15, waterTemp),
      siltLevel: Math.min(100, Math.max(0, siltLevel)),
      timestamp: new Date(),
    };
  }, []);

  // Update derived metrics
  const updateMetrics = useCallback((data: TelemetryData) => {
    const shadedCanalArea = 15000; // 15,000 m² of canal covered
    
    // Calculate water saved in this interval
    const evapRate = calculateEvaporationRate(
      data.temperatureAmbient,
      data.humidityPercent,
      shadedCanalArea
    );
    
    // Time delta in hours (0.5 seconds = 0.5/3600 hours)
    const timeDeltaHours = 0.5 / 3600;
    const waterSavedIncrement = evapRate * timeDeltaHours;
    cumulativeWaterRef.current += waterSavedIncrement;
    
    // Energy generated
    const energyIncrement = data.powerOutputKw * timeDeltaHours;
    cumulativeEnergyRef.current += energyIncrement;
    
    // Efficiency delta from cooling
    const efficiencyDelta = calculateEfficiencyDelta(data.temperaturePanel, data.waterTemp);
    
    // CO2 offset (0.85 kg CO2 per kWh in Nepal's grid)
    const co2OffsetKg = cumulativeEnergyRef.current * 0.85;
    
    // Panel cooling benefit in degrees
    const panelCoolingBenefit = 30 - (data.temperaturePanel - data.temperatureAmbient);

    setMetrics({
      waterSavedLiters: cumulativeWaterRef.current,
      efficiencyDelta,
      totalEnergyKwh: cumulativeEnergyRef.current,
      co2OffsetKg,
      panelCoolingBenefit: Math.max(0, panelCoolingBenefit),
    });
  }, []);

  // Throttled update loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newData = generateSimulatedData();
      
      // Add to buffer
      bufferRef.current.push(newData);
      
      // Only update state every 500ms
      if (now - lastUpdateRef.current >= 500) {
        // Average the buffered data
        if (bufferRef.current.length > 0) {
          const averaged: TelemetryData = {
            powerOutputKw: bufferRef.current.reduce((a, b) => a + b.powerOutputKw, 0) / bufferRef.current.length,
            temperaturePanel: bufferRef.current.reduce((a, b) => a + b.temperaturePanel, 0) / bufferRef.current.length,
            temperatureAmbient: bufferRef.current.reduce((a, b) => a + b.temperatureAmbient, 0) / bufferRef.current.length,
            humidityPercent: bufferRef.current.reduce((a, b) => a + b.humidityPercent, 0) / bufferRef.current.length,
            solarIrradiance: bufferRef.current.reduce((a, b) => a + b.solarIrradiance, 0) / bufferRef.current.length,
            waterTemp: bufferRef.current.reduce((a, b) => a + b.waterTemp, 0) / bufferRef.current.length,
            siltLevel: bufferRef.current.reduce((a, b) => a + b.siltLevel, 0) / bufferRef.current.length,
            timestamp: new Date(),
          };
          
          const smoothed = smoothData(averaged, lastDataRef.current);
          
          setTelemetry(smoothed);
          updateMetrics(smoothed);
          lastDataRef.current = smoothed;
          
          // Keep historical data (last 60 entries = 30 seconds at 500ms intervals)
          setHistoricalData(prev => [...prev.slice(-59), smoothed]);
          
          bufferRef.current = [];
          lastUpdateRef.current = now;
        }
      }
    }, 100); // Generate data every 100ms

    return () => clearInterval(interval);
  }, [generateSimulatedData, updateMetrics, smoothData]);

  return { telemetry, metrics, historicalData };
}
