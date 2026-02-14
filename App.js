import { useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Screen Imports
import { BottomTab } from "./src/navigation/BottomTab";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import HomeScreen from "./src/screens/dashboard/HomeScreen";
import MapScreen from "./src/screens/dashboard/MapScreen";
import ProfileScreen from "./src/screens/dashboard/ProfileScreen";
import ReportScreen from "./src/screens/dashboard/ReportScreen";

export default function App() {
  const [screen, setScreen] = useState("onboarding"); // 'onboarding', 'login', 'app'
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    if (screen === "onboarding")
      return <OnboardingScreen onFinish={() => setScreen("login")} />;
    if (screen === "login")
      return <LoginScreen onLogin={() => setScreen("app")} />;

    // Dashboard Logic
    return (
      <View className="flex-1">
        <View className="flex-1">
          {activeTab === "home" && <HomeScreen onNavigate={() => {}} />}
          {activeTab === "map" && <MapScreen />}
          {activeTab === "manual" && <ManualScreen />}
          {activeTab === "report" && <ReportScreen />}
          {activeTab === "profile" && (
            <ProfileScreen onLogout={() => setScreen("login")} />
          )}
        </View>
        <BottomTab active={activeTab} onChange={setActiveTab} />
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-white">
        {renderContent()}

        {/* --- VISIBLE PANIC BUTTON (Available on Login Screen) --- */}
        {screen === "login" && (
          <TouchableOpacity
            onPress={handleQuickSOS}
            style={{
              position: "absolute",
              top: 60,
              right: 20,
              backgroundColor: "#ef4444",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 50,
              zIndex: 999,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 16 }}>🚨</Text>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>
              EMERGENCY SOS
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaProvider>
  );
}
