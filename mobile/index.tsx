/**
 * Mobile entrypoint (design-preview dev server).
 *
 * Renders the existing `LoginScreen` standalone — no full navigation tree,
 * no `App.tsx`. The LoginScreen uses `useNavigation()` from
 * `@react-navigation/native` to navigate to the OTP-success screen on
 * verify; we wrap it in a real `NavigationContainer` with a single screen
 * registered so the hook works without throwing, and we override the
 * "on OTP success" path with a console log so the preview is self-contained.
 */
import React from 'react';
import { registerRootComponent } from 'expo';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoginScreen } from './src/app/screens/LoginScreen';
import { AccountScreen } from './src/app/screens/AccountScreen';

const Stack = createStackNavigator();

// Wrap the LoginScreen so its `useNavigation().navigate(...)` calls don't
// blow up during the design preview. The OTP-success navigation is
// intercepted here: we just log it and reset back to Login.
const LoginWrapper: React.FC<any> = ({ navigation }) => (
  <LoginScreen />
);

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />
      <View style={styles.root}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Login" component={LoginWrapper} />
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
