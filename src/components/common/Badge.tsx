import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  size?: 'sm' | 'md';
  icon?: keyof typeof Ionicons.glyphMap;
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = THEME.colors.text,
  bgColor = THEME.colors.surfaceSubtle,
  borderColor,
  size = 'md',
  icon,
  dot = false,
  style,
  textStyle,
}) => {
  const isSm = size === 'sm';
  const fontSize = isSm ? THEME.typography.size.xs : THEME.typography.size.sm;
  const paddingV = isSm ? 2 : 4;
  const paddingH = isSm ? 6 : 10;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor: borderColor || bgColor,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
        },
        style,
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
      {icon && (
        <Ionicons
          name={icon}
          size={fontSize + 2}
          color={color}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: THEME.typography.weight.medium,
  },
});
