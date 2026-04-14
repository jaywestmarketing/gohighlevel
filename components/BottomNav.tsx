import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GHLSection } from '../constants/sections';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  section: GHLSection;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: '⊞', path: 'dashboard',      section: 'dashboard'      },
  { label: 'Contacts',  icon: '👥', path: 'contacts',       section: 'contacts'       },
  { label: 'Chat',      icon: '💬', path: 'conversations',  section: 'conversations'  },
  { label: 'Calendar',  icon: '📅', path: 'calendar',       section: 'calendar'       },
  { label: 'Pipeline',  icon: '📊', path: 'opportunities',  section: 'opportunities'  },
];

interface BottomNavProps {
  currentSection: GHLSection;
  onNavigate: (path: string) => void;
  hidden?: boolean;
}

export default function BottomNav({ currentSection, onNavigate, hidden }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  if (hidden) return null;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = currentSection === item.section;
        return (
          <TouchableOpacity
            key={item.section}
            style={styles.tab}
            onPress={() => onNavigate(item.path)}
            activeOpacity={0.65}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
          >
            {isActive && <View style={styles.activeBar} />}
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#13131f',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2d2d44',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    top: -8,
    width: 36,
    height: 3,
    backgroundColor: '#4f8ef7',
    borderRadius: 2,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    color: '#666688',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#4f8ef7',
    fontWeight: '700',
  },
});
