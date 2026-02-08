import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/auth-context';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const auth = useAuth();

  if (auth.status === 'loading') {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading">
            {() => (
              <PlaceholderScreen
                title="Loading..."
                subtitle="Initializing secure session state."
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (auth.status !== 'signedIn') {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f1115' },
          headerTintColor: '#f6f4ef',
          contentStyle: { backgroundColor: '#0f1115' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'BMR' }} />
        <Stack.Screen name="BookPool" options={{ title: 'Book Pool' }}>
          {() => <PlaceholderScreen title="Book Pool" subtitle="Next: browse/search + book details." />}
        </Stack.Screen>
        <Stack.Screen name="MyLibrary" options={{ title: 'My Library' }}>
          {() => <PlaceholderScreen title="My Library" subtitle="Next: checked out books + offline download status." />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

