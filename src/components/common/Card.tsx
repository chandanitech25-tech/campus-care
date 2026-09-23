import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { THEME } from '../../constants/theme';

export interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  hoverable?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  hoverable = false,
  elevation = 'sm',
}) => {
  const getElevationStyle = (): ViewStyle => {
    switch (elevation) {
      case 'none':
        return {};
      case 'md':
        return THEME.shadows.md;
      case 'lg':
        return THEME.shadows.lg;
      case 'sm':
      default:
        return THEME.shadows.sm;
    }
  };

  const content = (
    <View
      style={[
        styles.card,
        getElevationStyle(),
        hoverable && Platform.OS === 'web' ? (styles.hoverable as any) : null,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.touchable}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    overflow: 'hidden',
  },
  touchable: {
    width: '100%',
  },
  hoverable: {
    ...Platform.select({
      web: {
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        cursor: 'pointer',
      } as any,
    }),
  },
});
