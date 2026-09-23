import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { StarRating } from './StarRating';
import { THEME } from '../../constants/theme';

export interface FeedbackModalProps {
  visible: boolean;
  complaintId: string;
  complaintTitle: string;
  onSubmit: (rating: number, comment?: string) => Promise<void>;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  complaintTitle,
  onSubmit,
  onClose,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating < 1) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Resolution Feedback"
      subtitle={`How satisfied are you with the resolution of: "${complaintTitle}"?`}
      maxWidth={500}
    >
      <View style={styles.container}>
        <View style={styles.ratingSection}>
          <Text style={styles.label}>Your Rating (1–5 Stars)</Text>
          <StarRating rating={rating} onRatingChange={setRating} size={32} />
          <Text style={styles.ratingHint}>
            {rating === 5 && 'Excellent - Issue resolved perfectly!'}
            {rating === 4 && 'Good - Satisfactory resolution.'}
            {rating === 3 && 'Average - Resolved with some delay.'}
            {rating === 2 && 'Poor - Unresolved aspects remain.'}
            {rating === 1 && 'Very Poor - Dissatisfied with service.'}
          </Text>
        </View>

        <Input
          label="Comments (Optional)"
          value={comment}
          onChangeText={setComment}
          placeholder="Share your thoughts on the promptness, quality, and staff behavior..."
          multiline
          numberOfLines={3}
          error={error}
        />

        <View style={styles.footer}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={onClose}
            style={styles.button}
          />
          <Button
            title="Submit Feedback"
            variant="primary"
            loading={isSubmitting}
            onPress={handleSubmit}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  ratingSection: {
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
  },
  label: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
    marginBottom: 8,
  },
  ratingHint: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 12,
  },
  button: {
    minWidth: 120,
  },
});
