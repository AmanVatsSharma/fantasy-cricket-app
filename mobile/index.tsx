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
import React, { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/app/screens/HomeScreen';
import { LandingScreen } from './src/app/screens/LandingScreen';
import { OtpScreen } from './src/app/screens/OtpScreen';
import { AccountScreen } from './src/app/screens/AccountScreen';

const Stack = createStackNavigator();

const ALLOWED_SCREENS = new Set(['Home', 'Landing', 'Otp', 'Account']);

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

  // Track route changes for debugging in the console
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log(`[dev] Loaded screen: ${initialRoute}`);
    }
  }, [initialRoute]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />
      <View style={styles.root}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
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
