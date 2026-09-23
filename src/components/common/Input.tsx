import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string | null;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  editable = true,
  keyboardType = 'default',
  style,
  inputStyle,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredStar}> *</Text>}
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
          !editable && styles.inputWrapperDisabled,
          multiline ? { minHeight: numberOfLines * 24 + 20, alignItems: 'flex-start' } : null,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={error ? THEME.colors.danger : isFocused ? THEME.colors.primary : THEME.colors.textLight}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={THEME.colors.textLight}
          secureTextEntry={isPassword && !showPassword}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline ? styles.multilineInput : null,
            inputStyle,
          ]}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIconButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={THEME.colors.textMuted}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconButton}
          >
            <Ionicons name={rightIcon} size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <View style={styles.messageRow}>
          <Ionicons name="alert-circle" size={14} color={THEME.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.medium,
    color: THEME.colors.text,
  },
  requiredStar: {
    color: THEME.colors.danger,
    fontWeight: THEME.typography.weight.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    minHeight: 44,
    ...Platform.select({
      web: {
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      } as any,
    }),
  },
  inputWrapperFocused: {
    borderColor: THEME.colors.primary,
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.12)',
      } as any,
    }),
  },
  inputWrapperError: {
    borderColor: THEME.colors.danger,
  },
  inputWrapperDisabled: {
    backgroundColor: THEME.colors.surfaceSubtle,
    opacity: 0.7,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIconButton: {
    padding: 4,
    marginLeft: 6,
  },
  input: {
    flex: 1,
    color: THEME.colors.text,
    fontSize: THEME.typography.size.md,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 10,
    paddingBottom: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.danger,
    fontWeight: THEME.typography.weight.medium,
  },
  helperText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
});
