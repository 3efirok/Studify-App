import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

export const Skeleton = ({
  width = '100%',
  height = 14,
  radius = 10,
  style,
}: SkeletonProps) => {
  const translateX = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: 150,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  return (
    <View style={[styles.container, { width, height, borderRadius: radius }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  shimmer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});

export default Skeleton;
