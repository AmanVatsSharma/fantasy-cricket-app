/**
 * Mobile entrypoint (design-preview dev server).
 *
 * Four-screen flow, switchable via URL query string for design review:
 *   /                 → Home       (default)
 *   /?screen=home     → Home
 *   /?screen=landing  → Landing    (11DREAMER entry / login)
 *   /?screen=otp      → OTP        (4-digit verification)
 *   /?screen=account  → Account    (existing)
 *
 * On native (iOS/Android), the URL query string is ignored and Home is
 * always the first screen.
 */
import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { registerRootComponent } from 'expo';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HomeScreen } from './src/app/screens/HomeScreen';
import { LandingScreen } from './src/app/screens/LandingScreen';
import { OtpScreen } from './src/app/screens/OtpScreen';
import { AccountScreen } from './src/app/screens/AccountScreen';
import { MyContestsScreen } from './src/app/screens/MyContestsScreen';
import { ContestLobbyScreen } from './src/app/screens/ContestLobbyScreen';
import { ContestJoinScreen } from './src/app/screens/ContestJoinScreen';
import { SidebarDrawer } from './src/app/components/SidebarDrawer';

const Stack = createStackNavigator();

const ALLOWED_SCREENS = new Set(['Home', 'Landing', 'Otp', 'Account', 'MyContests', 'ContestLobby', 'ContestJoin']);

// Drawer context: lets HomeScreen open the global SidebarDrawer and route
// menu taps into the active navigation stack (the drawer itself sits
// *outside* <NavigationContainer>, so it can't call useNavigation()).
const DrawerContext = createContext<{
  openDrawer: () => void;
  navigate: (route: string, params?: object) => void;
}>({ openDrawer: () => {}, navigate: () => {} });
export const useDrawer = () => useContext(DrawerContext);

function getInitialRouteName(): string {
  if (Platform.OS !== 'web') return 'Home';
  if (typeof window === 'undefined') return 'Home';
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get('screen') ?? '').toLowerCase();
    const candidate = raw.charAt(0).toUpperCase() + raw.slice(1);
    return ALLOWED_SCREENS.has(candidate) ? candidate : 'Home';
  } catch {
    return 'Home';
  }
}

function App() {
  // Compute once on mount. The user can refresh the page with a new
  // ?screen=... value to jump between screens without nav edits.
  const [initialRoute] = useState<string>(getInitialRouteName);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  // Keep a ref to the navigation object so the SidebarDrawer (which is
  // rendered above <NavigationContainer> and so cannot use
  // useNavigation()) can still dispatch route pushes via the context.
  const navRef = useRef<any>(null);
  const navigate = (route: string, params?: object) => {
    if (navRef.current) navRef.current.navigate(route, params);
  };

  // Track route changes for debugging in the console
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log(`[dev] Loaded screen: ${initialRoute}`);
    }
  }, [initialRoute]);

  return (
    // GestureHandlerRootView must wrap the entire app (above the
    // NavigationContainer) so React Navigation 7's native-driven
    // swipe-back gesture can intercept touches. On web it has no
    // effect, so this is harmless there.
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#080810" />
        <DrawerContext.Provider value={{ openDrawer, navigate }}>
          <View style={styles.root}>
            <NavigationContainer ref={navRef as any}>
              <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Landing" component={LandingScreen} />
                <Stack.Screen name="Otp" component={OtpScreen} />
                <Stack.Screen name="Account" component={AccountScreen} />
                <Stack.Screen name="MyContests" component={MyContestsScreen} />
                <Stack.Screen name="ContestLobby" component={ContestLobbyScreen} />
                <Stack.Screen name="ContestJoin" component={ContestJoinScreen} />
              </Stack.Navigator>
            </NavigationContainer>
            <SidebarDrawer visible={drawerVisible} onClose={closeDrawer} />
          </View>
        </DrawerContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080810',
  },
});

registerRootComponent(App);

export default App;
