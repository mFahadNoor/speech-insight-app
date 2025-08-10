import IconSymbol from '@/components/ui/IconSymbol';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1D1D1D' }}>
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
          tabBarShowLabel: false,
        }}
      >
        <MaterialTopTabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="house.fill" color={color} size={22} />,
          }}
        />
        {/* <MaterialTopTabs.Screen
          name="history"
          options={{
            tabBarIcon: ({ color }: { color: string }) => <IconSymbol name="clock.fill" color={color} size={22} />,
          }}
        /> */}
          <MaterialTopTabs.Screen
    name="history"
    options={{
      tabBarIcon: ({ color }: {color:string}) => <IconSymbol name="clock" color={color} size={24} />
    }}
  />
      </MaterialTopTabs>
    </SafeAreaView>
  );
}