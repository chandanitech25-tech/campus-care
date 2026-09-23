import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';

export interface BarChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

export interface ResponsiveBarChartProps {
  title: string;
  subtitle?: string;
  data: BarChartDataPoint[];
  secondaryLabel?: string;
  primaryLabel?: string;
}

export const ResponsiveBarChart: React.FC<ResponsiveBarChartProps> = ({
  title,
  subtitle,
  data,
  primaryLabel = 'Submitted',
  secondaryLabel = 'Resolved',
}) => {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.value, d.secondaryValue || 0)),
    1
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: THEME.colors.primary }]} />
            <Text style={styles.legendText}>{primaryLabel}</Text>
          </View>
          {data.some((d) => d.secondaryValue !== undefined) && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: THEME.colors.accent }]} />
              <Text style={styles.legendText}>{secondaryLabel}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.chartArea}>
        {data.map((item, idx) => {
          const primaryHeight = (item.value / maxValue) * 140;
          const secondaryHeight = item.secondaryValue
            ? (item.secondaryValue / maxValue) * 140
            : 0;

          return (
            <View key={idx} style={styles.barGroup}>
              <View style={styles.barsWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(primaryHeight, 4),
                      backgroundColor: item.color || THEME.colors.primary,
                    },
                  ]}
                />
                {item.secondaryValue !== undefined && (
                  <View
                    style={[
                      styles.bar,
                      styles.secondaryBar,
                      {
                        height: Math.max(secondaryHeight, 4),
                        backgroundColor: THEME.colors.accent,
                      },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.barLabel}>{item.label}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.lg,
    flexWrap: 'wrap',
    gap: 8,
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
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: 14,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  secondaryBar: {
    width: 14,
  },
  barLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
