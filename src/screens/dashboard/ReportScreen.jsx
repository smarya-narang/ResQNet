import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Header, Button } from '../../components/UIComponents';
import { Camera, MapPin, AlertTriangle } from 'lucide-react-native';
import { supabase } from '../../services/supabaseConfig';
import { auth } from '../../services/firebaseConfig'; // <--- Now this will work!
import * as Location from 'expo-location';

export default function ReportScreen() {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('General');
  const [details, setDetails] = useState('');

  const submitReport = async () => {
    if (!details.trim()) {
      Alert.alert("Missing Details", "Please describe the situation briefly.");
      return;
    }

    // --- FIX: Check if user is logged in ---
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to submit a report.");
      return;
    }
    // ---------------------------------------

    setLoading(true);
    try {
      let loc = await Location.getCurrentPositionAsync({});
      
      const { error } = await supabase.from('reports').insert({
        user_email: auth.currentUser.email, // <--- Safe access
        type: type,
        details: details,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (error) throw error;

      Alert.alert("Success", "Report submitted. Help is on the way.");
      setDetails('');
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Header title="Report Incident" />
      <ScrollView className="p-5" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
          <View className="flex-row items-center gap-2">
             <MapPin size={20} color="#258cf4" />
             <Text className="font-bold text-slate-800">Current Device Location</Text>
          </View>
          <Text className="text-xs text-slate-400 ml-7 mt-1"> GPS Accuracy: High</Text>
        </View>

        <Text className="font-bold text-slate-500 text-xs uppercase mb-2 ml-1">Incident Type</Text>
        <View className="flex-row gap-2 flex-wrap mb-6">
          {['Flood', 'Fire', 'Landslide', 'Medical', 'Blocked Road'].map(t => (
            <TouchableOpacity 
              key={t} 
              onPress={() => setType(t)}
              className={`px-4 py-3 rounded-xl border ${type === t ? 'bg-[#258cf4] border-[#258cf4]' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-bold ${type === t ? 'text-white' : 'text-slate-600'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="font-bold text-slate-500 text-xs uppercase mb-2 ml-1">Details</Text>
        <TextInput 
          value={details}
          onChangeText={setDetails}
          placeholder="Describe the situation..."
          multiline
          numberOfLines={4}
          className="bg-white p-4 rounded-xl border border-slate-200 text-slate-800 text-base mb-6 h-32"
          textAlignVertical="top"
        />

        <TouchableOpacity className="bg-slate-100 border-2 border-dashed border-slate-300 p-4 rounded-xl flex-row items-center justify-center gap-2 mb-6 h-16">
           <Camera size={20} color="#94a3b8" />
           <Text className="text-slate-500 font-bold">Add Photo Evidence</Text>
        </TouchableOpacity>

        {loading ? <ActivityIndicator size="large" color="#258cf4" /> : (
          <Button fullWidth onPress={submitReport} variant="danger">Submit Report</Button>
        )}
      </ScrollView>
    </View>
  );
}