import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Text, Card, Loading } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { useRouter } from 'expo-router';
import { getGlobalLeaderboard, getCountryLeaderboard, getActiveCountries, getMyRank, type LeaderboardEntry, type Country } from '@timetwin/api-sdk';

export default function LeaderboardScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCountries();
    loadLeaderboard();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCountry]);

  const loadCountries = async () => {
    try {
      const { data, error } = await getActiveCountries();
      if (data) {
        const mapped = data.map((c: any) => ({
            code: c.iso_code,
            name: c.name,
            iso_code: c.iso_code // ensure compatibility with diverse usage
        })).sort((a: any, b: any) => a.name.localeCompare(b.name));
        
        setCountries(mapped as any);
      }
    } catch {
      // Silently fail
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const leaderboardResult = selectedCountry === 'all'
        ? await getGlobalLeaderboard({ limit: 50 })
        : await getCountryLeaderboard(selectedCountry, { limit: 50 });

      const rankResult = await getMyRank();

      if (leaderboardResult.data) {
        setLeaderboard(leaderboardResult.data);
      }

      if (rankResult.rank !== null) {
        setMyRank(rankResult.rank);
      }
    } catch {
      // Error silently handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  if (loading) {
    return <Loading fullScreen text="Loading leaderboard..." />;
  }

  return (
    <Container padding={0}>
      <View style={styles.headerContainer}>
        {/* Left: My Rank */}
        <View style={styles.headerLeft}>
          {myRank !== null ? (
            <Text variant="h3" color="secondary">#{myRank}</Text>
          ) : <View />}
        </View>

        {/* Center: Title */}
        <View style={styles.headerCenter}>
          <Text variant="h2">Leaderboard</Text>
        </View>

        {/* Right: Filter */}
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            {showFilters ? (
                <Ionicons name="close" size={24} color={theme.colors.primary} />
            ) : (
                <Ionicons name="filter" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: theme.spacing[4] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Country Filter Panel */}
        {showFilters && (
          <Card variant="outlined" padding={4} style={{ marginBottom: theme.spacing[4] }}>
            <Text variant="label" style={{ marginBottom: theme.spacing[2] }}>
              Filter by country:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
                <TouchableOpacity
                  style={[
                    styles.countryButton,
                    { 
                      backgroundColor: selectedCountry === 'all' ? theme.colors.primary : 'transparent',
                      borderColor: theme.colors.primary 
                    }
                  ]}
                  onPress={() => setSelectedCountry('all')}
                >
                  <Text color={selectedCountry === 'all' ? 'background' : 'primary'}>Global 🌍</Text>
                </TouchableOpacity>
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country.iso_code}
                    style={[
                      styles.countryButton,
                      { 
                        backgroundColor: selectedCountry === country.iso_code ? theme.colors.primary : 'transparent',
                        borderColor: theme.colors.primary 
                      }
                    ]}
                    onPress={() => setSelectedCountry(country.iso_code)}
                  >
                    <Text color={selectedCountry === country.iso_code ? 'background' : 'primary'}>
                      {getFlagEmoji(country.iso_code)} {country.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Card>
        )}

        {/* Leaderboard List */}
        <View style={{ gap: theme.spacing[3] }}>
          {leaderboard.map((entry, index) => (
            <TouchableOpacity 
                key={`${entry.user_id}-${index}`} 
                onPress={() => router.push(`/user/${entry.user_id}`)}
                activeOpacity={0.7}
            >
              <Card padding={4} style={[
                styles.leaderboardItem,
                entry.user_id === 'me' && { borderColor: theme.colors.primary, borderWidth: 1 }
              ]}>
                {/* Rank Badge */}
                <View style={styles.rankBadge}>
                  <Text style={{ fontSize: 24 }}>{getRankIcon(index)}</Text>
                </View>
                
                {/* User Info */}
                <View style={styles.userInfo}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {entry.avatar_url && (
                        <Image 
                          source={{ uri: entry.avatar_url }} 
                          style={{ width: 24, height: 24, borderRadius: 12 }}
                        />
                      )}
                      <Text variant="body" bold>{entry.username}</Text>
                      <Text>{getFlagEmoji(entry.country_code)}</Text>
                   </View>
                </View>

                {/* Score */}
                <View style={styles.score}>
                  <Text variant="h3" color="primary">{entry.capture_count}</Text>
                  <Text variant="caption" color="secondary">twins</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}

function getFlagEmoji(countryCode: string) {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getRankIcon(index: number): string {
  switch (index) {
    case 0:
      return '🥇';
    case 1:
      return '🥈';
    case 2:
      return '🥉';
    default:
      return `#${index + 1}`;
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  headerLeft: {
    width: 70,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 70,
    alignItems: 'flex-end',
  },
  filterButton: {
    padding: 8,
  },
  countryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 45,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 4,
  },
  score: {
    alignItems: 'flex-end',
  },
});
