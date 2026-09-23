import React, { ReactNode } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';

export interface ResponsiveLayoutProps {
  children: ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= THEME.breakpoints.tablet; // >= 768px

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.rootContainer}>
        {/* Sidebar on desktop / tablet */}
        {isDesktop && <Sidebar />}

        {/* Main Content View */}
        <View style={styles.contentContainer}>
          <View style={styles.contentInner}>{children}</View>
        </View>

        {/* Mobile Tab Bar on phones */}
        {!isDesktop && <MobileTabBar />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  rootContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: THEME.colors.background,
  },
  contentInner: {
    flex: 1,
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
  },
});
