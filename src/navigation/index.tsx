import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { BookmarkListScreen } from '../screens/BookmarkListScreen';
import { Colors } from '../constants/colors';

export type RootStackParamList = {
  Main: undefined;
  Quiz: { category?: string; mode?: string };
  Exam: undefined;
  Result: { mode: string };
  BookmarkList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{label}</Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopWidth: 0.5,
          borderTopColor: Colors.border,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        options={{
          tabBarLabel: '分野別',
          tabBarIcon: ({ focused }) => <TabIcon label="📚" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: '記録',
          tabBarIcon: ({ focused }) => <TabIcon label="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '設定',
          tabBarIcon: ({ focused }) => <TabIcon label="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={({ route }) => ({
            title: route.params?.mode === 'review' ? '復習モード' : route.params?.mode === 'bookmark' ? 'ブックマーク復習' : '一問一答',
            headerBackTitle: '戻る',
          })}
        />
        <Stack.Screen
          name="Exam"
          component={ExamScreen}
          options={{ title: '模擬試験', headerBackVisible: false }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: '結果', headerBackVisible: false }}
        />
        <Stack.Screen
          name="BookmarkList"
          component={BookmarkListScreen}
          options={{ title: 'ブックマーク一覧', headerBackTitle: '戻る' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
