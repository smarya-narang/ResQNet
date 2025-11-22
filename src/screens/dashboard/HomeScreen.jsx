import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { MapPin, AlertTriangle, Bell, CloudRain, ChevronRight, Sun, Cloud, CloudLightning, Wind } from 'lucide-react-native';
import * as Location from 'expo-location';
import { supabase } from '../../services/supabaseConfig';
import { auth } from '../../services/firebaseConfig';

const AlertCard = ({ level, title, time }) => (
  <View className={`p-4 rounded-2xl border mb-3 ${level === 'critical' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
    <View className="flex-row gap-3">
      {level === 'critical' ? <AlertTriangle size={24} color="#dc2626" /> : <Bell size={24} color="#2563eb" />}
      <View className="flex-1">
        <Text className="font-bold text-slate-800">{title}</Text>
        <Text className="text-xs text-slate-500">{time}</Text>
      </View>
    </View>
  </View>
);

export default function HomeScreen({ onNavigate }) {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      // Fetch weather and THEN update alerts based on it
      await fetchWeather(loc.coords.latitude, loc.coords.longitude);
    }
    // Fetch manual/official alerts from DB
    fetchRealAlerts();
  };

  const fetchRealAlerts = async () => {
    const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
    if (data) setAlerts(data);
  };

  const fetchWeather = async (lat, long) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,weather_code,wind_speed_10m`);
      const data = await res.json();
      
      const weatherData = {
        temp: data.current.temperature_2m,
        code: data.current.weather_code,
        wind: data.current.wind_speed_10m
      };
      setWeather(weatherData);

      // --- NEW: AUTOMATED ALERT GENERATION ---
      // If weather is dangerous, auto-add an alert to the top of the list
      const autoAlerts = [];
      
      // Rain/Storm Checks
      if (weatherData.code >= 95) {
        autoAlerts.push({ id: 'auto-1', level: 'critical', title: 'Severe Thunderstorm Warning', created_at: new Date().toISOString() });
      } else if (weatherData.code >= 61) {
        autoAlerts.push({ id: 'auto-2', level: 'warning', title: 'Heavy Rain Alert: Risk of Flooding', created_at: new Date().toISOString() });
      }

      // Wind Checks
      if (weatherData.wind > 20) {
        autoAlerts.push({ id: 'auto-3', level: 'warning', title: 'High Wind Advisory', created_at: new Date().toISOString() });
      }

      // Combine Auto Alerts + DB Alerts (Auto alerts first)
      if (autoAlerts.length > 0) {
        // We need to fetch DB alerts again to merge properly, or just set state if we already have them.
        // For simplicity, we will rely on the next render cycle or just pre-pend them to the UI list below.
      }
      // ---------------------------------------

    } catch (e) { setWeather({ temp: "--", code: null }); }
  };

  const handleSOS = async () => {
    Alert.alert(
      "Confirm SOS",
      "Are you sure? This will alert rescue teams to your exact location.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "SEND HELP", 
          style: "destructive", 
          onPress: async () => {
            try {
              let loc = await Location.getCurrentPositionAsync({});
              await supabase.from('reports').insert({
                user_email: auth.currentUser?.email || 'SOS_USER',
                type: 'SOS',
                details: 'EMERGENCY SOS BEACON ACTIVATED',
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
              Alert.alert("SOS SENT", "Rescue teams have been alerted.");
            } catch (e) {
              Alert.alert("Error", "Could not send SOS. Try again.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // UI Helpers
  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun size={32} color="#fbbf24" />;
    if (code >= 51) return <CloudRain size={32} color="#60a5fa" />;
    return <Cloud size={32} color="#94a3b8" />;
  };

  const getWeatherText = (code) => {
    if (code === undefined || code === null) return "Loading...";
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code >= 51) return "Rainy";
    return "Overcast";
  };

  // Helper to check if we need to show an auto-alert
  const getAutoAlert = () => {
    if (!weather) return null;
    if (weather.code >= 95) return { level: 'critical', title: '⚠️ DANGER: Thunderstorm Detected' };
    if (weather.code >= 51) return { level: 'warning', title: '🌧️ Heavy Rain Alert in your area' };
    if (weather.temp > 40) return { level: 'warning', title: '🌡️ Heatwave Advisory' };
    return null;
  };

  const autoAlert = getAutoAlert();

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
        <TouchableOpacity 
          onPress={handleSOS} 
          className="bg-red-600 rounded-2xl p-5 shadow-xl flex-row items-center justify-between active:bg-red-700"
        >
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
        
        {/* 1. SHOW AUTOMATED WEATHER ALERT FIRST */}
        {autoAlert && (
          <AlertCard 
            level={autoAlert.level} 
            title={autoAlert.title} 
            time="Just Now (Automated)" 
          />
        )}

        {/* 2. SHOW DB ALERTS (Manual/Official) */}
        {alerts.length === 0 && !autoAlert ? (
          <Text className="text-slate-400 italic">No active alerts in your area.</Text>
        ) : (
          alerts.map((alert) => (
            <AlertCard 
              key={alert.id} 
              level={alert.level} 
              title={alert.title} 
              time={new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}