import React, { ReactNode } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme';

type ScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
};

export const Screen = ({
  children,
  scrollable = false,
  padded = true,
  backgroundColor = colors.background,
  contentStyle,
  footer,
}: ScreenProps) => {
  const containerStyle: StyleProp<ViewStyle> = [
    styles.content,
    padded && styles.padded,
    contentStyle,
  ];

  return (
    <View style={[styles.fill, { backgroundColor }]}>
      <LinearGradient
        colors={[backgroundColor, '#0b0f16', backgroundColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.glow} pointerEvents="none" />
        {scrollable ? (
          <ScrollView
            contentContainerStyle={containerStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, containerStyle]}>
            {children}
          </View>
        )}
        {footer ? (
          <View style={[styles.footer, padded && styles.footerPadded]}>
            {footer}
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
  },
  padded: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  flex: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 280 / 2,
    backgroundColor: 'rgba(124, 231, 255, 0.08)',
    opacity: 0.7,
  },
  footer: {
    paddingVertical: spacing.md,
  },
  footerPadded: {
    paddingHorizontal: spacing.xl,
  },
});

export default Screen;
