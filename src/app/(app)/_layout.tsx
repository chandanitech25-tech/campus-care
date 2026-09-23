import React from 'react';
import { Stack } from 'expo-router';
import { ResponsiveLayout } from '../../components/layout/ResponsiveLayout';

export default function AppLayout() {
  return (
    <ResponsiveLayout>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="complaints/index" />
        <Stack.Screen name="complaints/create" />
        <Stack.Screen name="complaints/[id]" />
        <Stack.Screen name="admin/analytics" />
        <Stack.Screen name="admin/sla" />
        <Stack.Screen name="admin/departments" />
        <Stack.Screen name="admin/users" />
        <Stack.Screen name="admin/feedback" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="profile" />
      </Stack>
    </ResponsiveLayout>
  );
}
