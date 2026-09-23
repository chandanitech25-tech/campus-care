import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = { ...styles.base };

    // Size
    if (size === 'sm') {
      base.paddingVertical = 6;
      base.paddingHorizontal = 12;
    } else if (size === 'lg') {
      base.paddingVertical = 14;
      base.paddingHorizontal = 24;
    } else {
      base.paddingVertical = 10;
      base.paddingHorizontal = 16;
    }

    // Variant
    switch (variant) {
      case 'secondary':
        base.backgroundColor = THEME.colors.surfaceSubtle;
        base.borderColor = THEME.colors.border;
        base.borderWidth = 1;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderColor = THEME.colors.primary;
        base.borderWidth = 1.5;
        break;
      case 'danger':
        base.backgroundColor = THEME.colors.danger;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'primary':
      default:
        base.backgroundColor = THEME.colors.primary;
        break;
    }

    if (disabled || loading) {
      base.opacity = 0.55;
    }

    return base;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'secondary':
        return THEME.colors.text;
      case 'outline':
      case 'ghost':
        return THEME.colors.primary;
      case 'danger':
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  const getFontSize = (): number => {
    if (size === 'sm') return THEME.typography.size.sm;
    if (size === 'lg') return THEME.typography.size.lg;
    return THEME.typography.size.md;
  };

  const textColor = getTextColor();
  const fontSize = getFontSize();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={fontSize + 2}
              color={textColor}
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            style={[
              styles.text,
              { color: textColor, fontSize },
              variant === 'outline' || variant === 'ghost' ? styles.mediumWeight : styles.semiboldWeight,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={fontSize + 2}
              color={textColor}
              style={{ marginLeft: 6 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.radius.md,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, opacity 0.15s ease',
      } as any,
    }),
  },
  text: {
    textAlign: 'center',
  },
  mediumWeight: {
    fontWeight: THEME.typography.weight.medium,
  },
  semiboldWeight: {
    fontWeight: THEME.typography.weight.semibold,
  },
});
