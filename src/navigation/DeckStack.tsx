import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeckListScreen from '../screens/decks/DeckListScreen';
import DeckDetailsScreen from '../screens/decks/DeckDetailsScreen';
import CardListScreen from '../screens/decks/CardListScreen';
import CardEditScreen from '../screens/decks/CardEditScreen';
import QuestionListScreen from '../screens/decks/QuestionListScreen';
import QuestionCreateEditScreen from '../screens/decks/QuestionCreateEditScreen';
import SessionStartScreen from '../screens/decks/SessionStartScreen';
import TestSessionScreen from '../screens/decks/TestSessionScreen';
import SessionResultScreen from '../screens/decks/SessionResultScreen';
import CardSessionScreen from '../screens/decks/CardSessionScreen';
import DeckCreateEditScreen from '../screens/decks/DeckCreateEditScreen';
import SharedDeckScreen from '../screens/shared/SharedDeckScreen';
import FlashTestSessionScreen from '../screens/decks/FlashTestSessionScreen';
import { DeckStackParamList } from './types';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<DeckStackParamList>();

export const DeckStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="DeckList" component={DeckListScreen} />
    <Stack.Screen name="DeckCreateEdit" component={DeckCreateEditScreen} />
    <Stack.Screen name="DeckDetails" component={DeckDetailsScreen} />
    <Stack.Screen name="Cards" component={CardListScreen} />
    <Stack.Screen name="CardEdit" component={CardEditScreen} />
    <Stack.Screen name="Questions" component={QuestionListScreen} />
    <Stack.Screen name="QuestionEdit" component={QuestionCreateEditScreen} />
    <Stack.Screen name="SessionStart" component={SessionStartScreen} />
    <Stack.Screen name="Session" component={TestSessionScreen} />
    <Stack.Screen name="FlashTestSession" component={FlashTestSessionScreen} />
    <Stack.Screen name="CardSession" component={CardSessionScreen} />
    <Stack.Screen name="SessionResult" component={SessionResultScreen} />
    <Stack.Screen name="SharedDeck" component={SharedDeckScreen} />
  </Stack.Navigator>
);

export default DeckStack;
