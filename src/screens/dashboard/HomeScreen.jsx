import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { MapPin, AlertTriangle, Bell, CloudRain, ChevronRight, Sun, Cloud, Zap } from 'lucide-react-native';
import * as Location from 'expo-location';
import { supabase } from '../../services/supabaseConfig';
import { auth } from '../../services/firebaseConfig';

// --- UPDATED ALERT CARD ---
// Added 'message' prop and a Text component to display it
const AlertCard = ({ level, title, message, time, source }) => (
  <View className={`p-4 rounded-2xl border mb-3 ${level === 'critical' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
    <View className="flex-row gap-3">
      {level === 'critical' ? <AlertTriangle size={24} color="#dc2626" /> : <Bell size={24} color="#2563eb" />}
      <View className="flex-1">
        <Text className="font-bold text-slate-800">{title}</Text>
        
        {/* NEW: Render the sub-text message if available */}
        {message ? (
          <Text className="text-sm text-slate-600 mt-1">{message}</Text>
        ) : null}

        <Text className="text-xs text-slate-500 mt-1">{time} • Source: {source}</Text>
      </View>
    </View>
  </View>
);

export default function HomeScreen({ onNavigate }) {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [dbAlerts, setDbAlerts] = useState([]); // Manual Alerts
  const [predictiveAlerts, setPredictiveAlerts] = useState([]); // Automated Alerts
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    // Real-time DB subscription
    const subscription = supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        setDbAlerts((prev) => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  const loadData = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      fetchWeather(loc.coords.latitude, loc.coords.longitude);
    }
    fetchRealAlerts();
  };

  const fetchRealAlerts = async () => {
    const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
    if (data) setDbAlerts(data);
  };

  // --- THE "BRAIN": Fetches Data & Runs Prediction ---
  const fetchWeather = async (lat, long) => {
    try {
      // 1. Fetch ALL required data points (Rain, Wind, Code)
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,weather_code,wind_speed_10m,precipitation&daily=precipitation_sum&timezone=auto`);
      const data = await res.json();
      
      const current = data.current;
      
      setWeather({
        temp: current.temperature_2m,
        code: current.weather_code,
        wind: current.wind_speed_10m,
        rain: current.precipitation
      });

      // 2. Trigger the Prediction Logic
      runDisasterPredictionModel(current);

    } catch (e) { setWeather({ temp: "--", code: null }); }
  };

  // --- PREDICTIVE LOGIC MODULE ---
  const runDisasterPredictionModel = (data) => {
    const alerts = [];
    const now = "Live Analysis";

    // Rule 1: Thunderstorm / Lightning (WMO Code 95+)
    if (data.weather_code >= 95) {
      alerts.push({ 
        id: 'pred-1', 
        level: 'critical', 
        title: 'Severe Thunderstorm Predicted', 
        message: 'High electrical activity detected in atmosphere.', // Added dummy message for consistency
        time: now, 
        source: 'Automated Weather Model' 
      });
    }
    
    // Rule 2: Flash Flood Risk (Rain > 2.0mm/hr is heavy)
    if (data.precipitation > 2.0) { 
       alerts.push({ 
         id: 'pred-2', 
         level: 'critical', 
         title: 'Flash Flood Risk', 
         message: `Heavy rainfall (${data.precipitation}mm) detected. Seek higher ground.`,
         time: now, 
         source: 'Hydro-Analysis Bot' 
       });
    }

    // Rule 3: High Wind / Cyclone Risk (> 40km/h)
    if (data.wind_speed_10m > 40) {
       alerts.push({ 
         id: 'pred-3', 
         level: 'warning', 
         title: 'High Wind Advisory', 
         message: `Wind speeds reaching ${data.wind_speed_10m}km/h. Secure loose objects.`,
         time: now, 
         source: 'Anemometer Network' 
       });
    }

    setPredictiveAlerts(alerts);
  };

  const handleSOS = async () => {
    Alert.alert("Confirm SOS", "Send emergency beacon?", [
      { text: "Cancel", style: "cancel" },
      { text: "SEND", onPress: async () => {
          let loc = await Location.getCurrentPositionAsync({});
          await supabase.from('reports').insert({ 
            user_email: auth.currentUser?.email || 'SOS', type: 'SOS', 
            details: 'SOS BEACON', latitude: loc.coords.latitude, longitude: loc.coords.longitude 
          });
          Alert.alert("SOS Sent", "Rescue teams notified.");
      }}
    ]);
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun size={32} color="#fbbf24" />;
    if (code >= 95) return <Zap size={32} color="#f59e0b" />;
    if (code >= 51) return <CloudRain size={32} color="#60a5fa" />;
    return <Cloud size={32} color="#94a3b8" />;
  };

  const getWeatherText = (code) => {
    if (code === undefined || code === null) return "Loading...";
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code >= 95) return "Thunderstorm";
    if (code >= 51) return "Rainy";
    return "Overcast";
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      className="flex-1 bg-[#f8fafc]" 
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="bg-slate-900 pt-16 pb-8 px-6 rounded-b-[2.5rem]">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase">Your Live Location</Text>
            <View className="flex-row items-center mt-1">
              <MapPin size={16} color={location ? "#22c55e" : "#60a5fa"} />
              <Text className="text-white font-bold ml-1 text-lg">
                {location ? `${location.coords.latitude.toFixed(3)}, ${location.coords.longitude.toFixed(3)}` : "Locating..."}
              </Text>
            </View>
          </View>
        </View>
        <View className="bg-white/10 p-4 rounded-2xl flex-row items-center border border-white/10">
          {getWeatherIcon(weather?.code)}
          <View className="ml-4 flex-1">
            <Text className="text-slate-300 text-xs">Live Weather</Text>
            <Text className="text-white font-bold text-lg">{getWeatherText(weather?.code)}</Text>
          </View>
          <Text className="text-white font-bold text-2xl">
            {weather && weather.temp !== undefined ? `${weather.temp}°C` : "--"}
          </Text>
        </View>
      </View>

      <View className="px-6 -mt-6">
        <TouchableOpacity onPress={handleSOS} className="bg-red-600 rounded-2xl p-5 shadow-xl flex-row items-center justify-between active:bg-red-700">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center animate-pulse">
              <AlertTriangle size={24} color="white" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Emergency SOS</Text>
              <Text className="text-red-100 text-xs">Broadcast to Rescue Teams</Text>
            </View>
          </View>
          <ChevronRight color="#fecaca" />
        </TouchableOpacity>
      </View>

      <View className="p-6">
        <Text className="text-lg font-bold text-slate-800 mb-4">Live Updates</Text>
        
        {/* 1. RENDER PREDICTED ALERTS */}
        {predictiveAlerts.map((alert) => (
           <AlertCard 
             key={alert.id} 
             level={alert.level} 
             title={alert.title} 
             message={alert.message} // Passing message for consistency
             time={alert.time} 
             source={alert.source} 
           />
        ))}

        {/* 2. RENDER OFFICIAL DB ALERTS */}
        {dbAlerts.map((alert) => (
           <AlertCard 
             key={alert.id} 
             level={alert.level} 
             title={alert.title} 
             // UPDATED: Now passing the 'message' column from Supabase
             message={alert.message}
             time={new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
             source="Govt. Official"
           />
        ))}

        {predictiveAlerts.length === 0 && dbAlerts.length === 0 && (
          <View className="items-center mt-4">
             <View className="bg-green-100 p-4 rounded-full mb-2"><Sun size={24} color="#16a34a"/></View>
             <Text className="text-slate-500 font-medium">No active risks detected.</Text>
             <Text className="text-slate-400 text-xs mt-1">Area Safe</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}