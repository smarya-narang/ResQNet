import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

// Screen Imports
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import HomeScreen from './src/screens/dashboard/HomeScreen';
import MapScreen from './src/screens/dashboard/MapScreen';
import ReportScreen from './src/screens/dashboard/ReportScreen';
import ProfileScreen from './src/screens/dashboard/ProfileScreen';
import { BottomTab } from './src/navigation/BottomTab';

export default function App() {
  const [screen, setScreen] = useState('onboarding'); // 'onboarding', 'login', 'app'
  const [activeTab, setActiveTab] = useState('home');


  const renderContent = () => {
    
    if (screen === 'onboarding') return <OnboardingScreen onFinish={() => setScreen('login')} />;
    if (screen === 'login') return <LoginScreen onLogin={() => setScreen('app')} />;

    // Dashboard Logic
    return (
      <View className="flex-1">
        <View className="flex-1">
          {activeTab === 'home' && <HomeScreen onNavigate={() => {}} />}
          {activeTab === 'map' && <MapScreen />}
          {activeTab === 'report' && <ReportScreen />}
          {activeTab === 'profile' && <ProfileScreen onLogout={() => setScreen('login')} />}
        </View>
        <BottomTab active={activeTab} onChange={setActiveTab} />
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-white">
        {renderContent()}
      </View>
    </SafeAreaProvider>
  );
}