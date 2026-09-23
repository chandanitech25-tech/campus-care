import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';

export interface DonutSegment {
  label: string;
  count: number;
  color: string;
}

export interface ResponsiveDonutChartProps {
  title: string;
  subtitle?: string;
  segments: DonutSegment[];
}

export const ResponsiveDonutChart: React.FC<ResponsiveDonutChartProps> = ({
  title,
  subtitle,
  segments,
}) => {
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Segmented distribution bar */}
      <View style={styles.progressBarWrapper}>
        {segments.map((seg, idx) => {
          const pct = total > 0 ? (seg.count / total) * 100 : 0;
          if (pct <= 0) return null;
          return (
            <View
              key={idx}
              style={[
                styles.progressSegment,
                {
                  width: `${pct}%`,
                  backgroundColor: seg.color,
                },
                idx === 0 && styles.firstSegment,
                idx === segments.length - 1 && styles.lastSegment,
              ]}
            />
          );
        })}
      </View>

      {/* List breakdown */}
      <View style={styles.breakdownList}>
        {segments.map((seg, idx) => {
          const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0;
          return (
            <View key={idx} style={styles.breakdownItem}>
              <View style={styles.labelCol}>
                <View style={[styles.colorDot, { backgroundColor: seg.color }]} />
                <Text style={styles.itemLabel} numberOfLines={1}>
                  {seg.label}
                </Text>
              </View>
              <View style={styles.valCol}>
                <Text style={styles.itemCount}>{seg.count}</Text>
                <Text style={styles.itemPct}>{pct}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  header: {
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surfaceSubtle,
    marginVertical: 12,
  },
  progressSegment: {
    height: '100%',
  },
  firstSegment: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  lastSegment: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  breakdownList: {
    marginTop: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  itemLabel: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.text,
  },
  valCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemCount: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  itemPct: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    width: 32,
    textAlign: 'right',
  },
});
