import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DeckStack from './DeckStack';
import SessionsScreen from '../screens/SessionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { AppTabsParamList } from './types';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<AppTabsParamList>();

const TabIcon = ({ focused, name }: { focused: boolean; name: keyof typeof Ionicons.glyphMap }) => (
  <Ionicons name={name} size={22} color={focused ? colors.accent : colors.textSecondary} />
);

export const AppTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#090c12',
        borderTopColor: colors.border,
        height: 70,
        paddingBottom: 12,
        paddingTop: 8,
      },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Decks"
      component={DeckStack}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="home-outline" />,
      }}
    />
    <Tab.Screen
      name="Sessions"
      component={SessionsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="time-outline" />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="person-outline" />,
      }}
    />
  </Tab.Navigator>
);

export default AppTabs;
