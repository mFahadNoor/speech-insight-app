import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarIndicatorStyle: {
            backgroundColor: 'transparent',
        },
        tabBarStyle: {
            backgroundColor: 'transparent',
            height: 0,
        },
      }}
      >
      <MaterialTopTabs.Screen name="home" />
      <MaterialTopTabs.Screen name="history" />
    </MaterialTopTabs>
  );
}