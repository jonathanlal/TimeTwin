import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Container, Text, Card, Loading } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { getGlobalLeaderboard, getCountryLeaderboard, getAllCountries, getMyRank, type LeaderboardEntry, type Country } from '@timetwin/api-sdk';

export default function LeaderboardScreen() {
  const { theme } = useTheme();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCountries();
    loadLeaderboard();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCountry]);

  const loadCountries = async () => {
    try {
      const { data } = await getAllCountries();
      if (data) {
        setCountries(data);
      }
    } catch {
      // Silently fail - countries are optional
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
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing[4] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={[styles.header, { marginBottom: theme.spacing[4] }]}>
          <Text variant="h2" align="center">
            Leaderboard
          </Text>
          {myRank !== null && (
            <Text variant="body" color="secondary" align="center" style={{ marginTop: theme.spacing[2] }}>
              Your Rank: #{myRank}
            </Text>
          )}
        </View>

        {/* Country Filter */}
        <Card variant="outlined" padding={4} style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="label" style={{ marginBottom: theme.spacing[2] }}>
            Filter by country:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
            <TouchableOpacity
              onPress={() => setSelectedCountry('all')}
              style={[
                styles.countryButton,
                {
                  backgroundColor: selectedCountry === 'all' ? theme.colors.primary : theme.colors.cardBackground,
                  borderColor: selectedCountry === 'all' ? theme.colors.primary : theme.colors.border,
                }
              ]}
            >
              <Text
                variant="bodySmall"
                style={{ color: selectedCountry === 'all' ? '#fff' : theme.colors.text }}
              >
                All Countries
              </Text>
            </TouchableOpacity>
            {countries.map((country) => (
              <TouchableOpacity
                key={country.code}
                onPress={() => setSelectedCountry(country.code)}
                style={[
                  styles.countryButton,
                  {
                    backgroundColor: selectedCountry === country.code ? theme.colors.primary : theme.colors.cardBackground,
                    borderColor: selectedCountry === country.code ? theme.colors.primary : theme.colors.border,
                  }
                ]}
              >
                <Text
                  variant="bodySmall"
                  style={{ color: selectedCountry === country.code ? '#fff' : theme.colors.text }}
                >
                  {country.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {leaderboard.length === 0 ? (
          <Card variant="outlined" padding={8}>
            <Text variant="body" color="secondary" align="center">
              No entries yet. Be the first!
            </Text>
          </Card>
        ) : (
          <View style={[styles.list, { gap: theme.spacing[2] }]}>
            {leaderboard.map((entry, index) => (
              <Card
                key={entry.user_id}
                variant="outlined"
                padding={4}
                style={[
                  styles.leaderboardItem,
                  index < 3 && { borderColor: getRankColor(index, theme) },
                ]}
              >
                <View style={styles.rankBadge}>
                  <Text variant="h4" style={{ color: getRankColor(index, theme) }}>
                    {getRankIcon(index)}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text variant="body" bold>
                    {entry.username || 'Anonymous'}
                  </Text>
                  {entry.country_code && (
                    <Text variant="bodySmall" color="secondary">
                      {entry.country_code}
                    </Text>
                  )}
                </View>

                <View style={styles.score}>
                  <Text variant="h4" align="right">
                    {entry.total_captures}
                  </Text>
                  <Text variant="caption" color="secondary" align="right">
                    captures
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Container>
  );
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

function getRankColor(index: number, theme: any): string {
  switch (index) {
    case 0:
      return '#FFD700'; // Gold
    case 1:
      return '#C0C0C0'; // Silver
    case 2:
      return '#CD7F32'; // Bronze
    default:
      return theme.colors.border;
  }
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
  },
  list: {
    width: '100%',
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
    width: 50,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  score: {
    alignItems: 'flex-end',
  },
});
