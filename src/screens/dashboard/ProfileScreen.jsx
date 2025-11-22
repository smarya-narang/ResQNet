import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../../components/UIComponents';
import { LogOut, ChevronRight, User, Shield, Bell } from 'lucide-react-native';
import { getAuth } from 'firebase/auth';

export default function ProfileScreen({ onLogout }) {
  const auth = getAuth();
  const user = auth.currentUser;

  const displayName = user?.displayName || "ResQNet User";
  const email = user?.email || "No Email";
  const initials = displayName.split(" ").map((n)=>n[0]).join("").substring(0,2).toUpperCase();

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Header title="My Profile" />
      <View className="p-5">
        {/* User Card */}
        <View className="bg-white p-6 rounded-3xl shadow-sm mb-6 flex-row items-center gap-4">
          <View className="w-16 h-16 bg-slate-200 rounded-full items-center justify-center border-4 border-white shadow-sm">
            <Text className="text-xl font-bold text-slate-500">{initials}</Text>
          </View>
          <View>
            <Text className="text-lg font-bold text-slate-900">{displayName}</Text>
            <Text className="text-slate-500 text-sm">{email}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="space-y-3">
           <TouchableOpacity 
             onPress={() => Alert.alert("Account", "Edit Profile feature coming soon!")}
             className="bg-white p-4 rounded-2xl border border-slate-200 flex-row justify-between items-center active:bg-slate-50"
           >
              <View className="flex-row items-center gap-3">
                 <View className="bg-blue-50 p-2 rounded-full"><User size={20} color="#258cf4"/></View>
                 <Text className="font-bold text-slate-700">Account Details</Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
           </TouchableOpacity>

           {/* --- FIXED: Added onPress to Notifications --- */}
           <TouchableOpacity 
             onPress={() => Alert.alert("Notifications", "No new alerts.")} 
             className="bg-white p-4 rounded-2xl border border-slate-200 flex-row justify-between items-center active:bg-slate-50"
           >
              <View className="flex-row items-center gap-3">
                 <View className="bg-orange-50 p-2 rounded-full"><Bell size={20} color="#f97316"/></View>
                 <Text className="font-bold text-slate-700">Notifications</Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
           </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => {
            auth.signOut();
            onLogout();
          }} 
          className="mt-6 bg-red-50 p-4 rounded-xl flex-row items-center justify-center active:bg-red-100"
        >
          <LogOut size={20} color="#dc2626" />
          <Text className="text-red-600 font-bold ml-2">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}