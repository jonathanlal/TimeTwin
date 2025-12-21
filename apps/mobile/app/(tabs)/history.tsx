import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@timetwin/theme';
import { Text, Button, Input, Loading } from '@timetwin/ui';
import { getMyCaptures, type Capture, type CaptureMood } from '@timetwin/api-sdk';

const MOOD_EMOJIS: Record<string, string> = {
  excited: '🤩',
  happy: '🙂',
  neutral: '😐',
  sad: '😢',
  angry: '😠',
  love: '😍',
};

export default function HistoryScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [filteredCaptures, setFilteredCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [moodFilter, setMoodFilter] = useState<string>('all');

  const loadCaptures = useCallback(async () => {
    if (!user) return;
    try {
      // Create a unique variable to force updates if needed, though getMyCaptures is a fetch
      console.log('Loading history captures...');
      const { data, error } = await getMyCaptures({ limit: 1000 });

      if (error) {
        console.error("Load captures error:", error);
        return;
      }

      if (data) {
        console.log(`Loaded ${data.length} captures`);
        setCaptures(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadCaptures();
    }, [loadCaptures])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCaptures();
  }, [loadCaptures]);

  // Filter effect
  useEffect(() => {
    applyFilters();
  }, [captures, startDate, endDate, moodFilter]);

  const applyFilters = () => {
    let filtered = [...captures];

    // Date filters
    if (startDate) {
      filtered = filtered.filter(c => new Date(c.server_ts) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(c => new Date(c.server_ts) <= new Date(endDate + 'T23:59:59'));
    }

    // Mood filter
    if (moodFilter !== 'all') {
      if (moodFilter === 'none') {
        filtered = filtered.filter(c => !c.mood);
      } else {
        filtered = filtered.filter(c => c.mood === moodFilter);
      }
    }

    setFilteredCaptures(filtered);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: 76,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      position: 'relative',
    },
    filterToggle: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      zIndex: 10,
    },
    filterPanel: {
      backgroundColor: theme.colors.surfaceSecondary,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    tableHeader: {
      flexDirection: 'row',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      alignItems: 'center',
    },
    colTime: {
      width: 100,
    },
    colMood: {
      width: 50,
      alignItems: 'center',
    },
    colNote: {
      flex: 1,
      paddingLeft: 8,
    },
    moodFilterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
  });

  if (loading && captures.length === 0) {
    return <Loading fullScreen text="Loading history..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Left: Count */}
        <Text 
          variant="caption" 
          color="secondary" 
          style={{ position: 'absolute', left: 20, bottom: 20 }}
        >
          {filteredCaptures.length} captures
        </Text>

        {/* Center: Title */}
        <Text variant="h2" align="center">History</Text>

        {/* Right: Filter */}
        <TouchableOpacity 
          style={styles.filterToggle} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text variant="body" color="primary" bold>
            {showFilters ? 'Done' : 'Filter 🔍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Collapsible Filters */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <Text variant="label">Filter by Mood</Text>
          <View style={styles.moodFilterContainer}>
            <Button
              size="sm"
              variant={moodFilter === 'all' ? 'primary' : 'outline'}
              onPress={() => setMoodFilter('all')}
            >
              All
            </Button>
            {Object.keys(MOOD_EMOJIS).map(key => (
              <Button
                key={key}
                size="sm"
                variant={moodFilter === key ? 'primary' : 'outline'}
                onPress={() => setMoodFilter(key)}
              >
                {MOOD_EMOJIS[key]}
              </Button>
            ))}
          </View>
        </View>
      )}

      {/* Table List */}
      <ScrollView 
        contentContainerStyle={styles.listContent}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Table Head */}
        <View style={styles.tableHeader}>
          <Text variant="label" style={styles.colTime}>Time</Text>
          <Text variant="label" style={styles.colMood}>Vibe</Text>
          <Text variant="label" style={styles.colNote}>Note</Text>
        </View>

        {filteredCaptures.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text color="secondary">No records found.</Text>
          </View>
        ) : (
          filteredCaptures.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.row}
              onPress={() => router.push(`/capture/${item.id}`)}
            >
              <View style={styles.colTime}>
                <Text variant="bodySmall" bold>{formatDate(item.server_ts).split(', ')[0]}</Text>
                <Text variant="caption" color="secondary">{formatDate(item.server_ts).split(', ')[1]}</Text>
              </View>
              
              <View style={styles.colMood}>
                <Text style={{ fontSize: 24 }}>
                  {item.mood ? (MOOD_EMOJIS[item.mood] || item.mood) : '-'}
                </Text>
              </View>
              
              <View style={styles.colNote}>
                <Text variant="bodySmall" numberOfLines={2}>
                  {item.note || <Text color="secondary" style={{ fontStyle: 'italic' }}>No note</Text>}
                </Text>
              </View>

              <View style={{ justifyContent: 'center', marginLeft: 8 }}>
                <Text color="secondary">›</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
