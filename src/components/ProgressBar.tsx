import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: Props) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${Math.min(percentage, 100)}%` }]} />
      </View>
      <Text style={styles.text}>
        {current} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  barBackground: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
});
