import IconSymbol from '@/components/ui/IconSymbol';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
        tabBarIndicatorStyle: {
          backgroundColor: '#fff',
          height: 2,
        },
        tabBarStyle: {
          backgroundColor: '#1D1D1D',
        },
        tabBarShowIcon: true,
      }}
    >
      <MaterialTopTabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="house.fill" color={color} />,
        }}
      />
      <MaterialTopTabs.Screen
        name="history"
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="clock.fill" color={color} />,
        }}
      />
    </MaterialTopTabs>
  );
}