import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

export interface StarRatingProps {
  rating: number; // 0 to 5
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 28,
  readonly = false,
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {stars.map((star) => {
        const isFilled = star <= rating;
        return (
          <TouchableOpacity
            key={star}
            disabled={readonly || !onRatingChange}
            onPress={() => onRatingChange && onRatingChange(star)}
            style={styles.starTouch}
            accessibilityRole="button"
            accessibilityLabel={`${star} stars`}
          >
            <Ionicons
              name={isFilled ? 'star' : 'star-outline'}
              size={size}
              color={isFilled ? '#F59E0B' : THEME.colors.textLight}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starTouch: {
    padding: 2,
  },
});
