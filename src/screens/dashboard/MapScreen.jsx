import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Header } from '../../components/UIComponents';
import { supabase } from '../../services/supabaseConfig'; // <--- Import DB

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [shelters, setShelters] = useState([]); // <--- State for Shelters

  useEffect(() => {
    (async () => {
      // 1. Get User Location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05, // Zoom level
        longitudeDelta: 0.05,
      });

      // 2. Fetch Shelters from PostgreSQL
      const { data, error } = await supabase.from('shelters').select('*');
      if (data) setShelters(data);
    })();
  }, []);

  return (
    <View className="flex-1 bg-white w-full h-full">
      <Header title="Safe Routes" />
      {location ? (
        <MapView 
          style={{ width: '100%', height: '100%', flex: 1 }}
          initialRegion={location}
          showsUserLocation={true} 
        >
          {/* Render Real Shelters from DB */}
          {shelters.map((shelter) => (
            <Marker 
              key={shelter.id}
              coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
              title={shelter.name}
              description={shelter.type}
              pinColor="green"
            />
          ))}
        </MapView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#258cf4" />
          <Text className="text-slate-500 mt-4">Locating Safe Zones...</Text>
        </View>
      )}
    </View>
  );
}