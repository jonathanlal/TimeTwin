import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Card, Input, Button } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { searchProfiles, type Profile } from '@timetwin/api-sdk';

export default function SearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await searchProfiles(query.trim(), 20);

      if (error) {
        console.error('Search error:', error);
        setResults([]);
        return;
      }

      if (data) {
        setResults(data);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    header: {
      paddingTop: 60,
      paddingHorizontal: theme.spacing[4],
      paddingBottom: theme.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing[4],
    },
    searchBox: {
      marginBottom: theme.spacing[4],
    },
    resultCard: {
      marginBottom: theme.spacing[3],
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing[8],
      gap: theme.spacing[2],
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1">Search Users</Text>
        <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
          Find other TimeTwin users by username
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <Input
            placeholder="Enter username..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <Button
            title={loading ? 'Searching...' : 'Search'}
            onPress={handleSearch}
            disabled={loading}
            variant="primary"
            style={{ marginTop: theme.spacing[2] }}
          />
        </View>

        {/* Results */}
        {searched ? (
          <Card variant="outlined" padding={4}>
            <Text variant="h4" style={{ marginBottom: theme.spacing[3] }}>
              Search Results
            </Text>
            <Text
              variant="caption"
              style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing[4] }}
            >
              {results.length === 0
                ? 'No users found matching your search'
                : `Found ${results.length} user${results.length === 1 ? '' : 's'}`}
            </Text>

            {results.length > 0 ? (
              <View style={{ gap: theme.spacing[3] }}>
                {results.map((profile) => (
                  <TouchableOpacity
                    key={profile.id}
                    onPress={() => router.push(`/user/${profile.id}`)}
                  >
                    <Card
                      variant="outlined"
                      padding={4}
                      style={[
                        styles.resultCard,
                        { borderColor: theme.colors.border }
                      ]}
                    >
                      <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                          <Text style={{ fontSize: 20 }}>👤</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text variant="body" bold>
                            {profile.username || 'Anonymous'}
                          </Text>
                          {profile.country_code && (
                            <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                              {profile.country_code}
                            </Text>
                          )}
                        </View>
                        <View>
                          <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                            {profile.timezone}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 48 }}>🔍</Text>
                <Text variant="body" style={{ color: theme.colors.textSecondary }}>
                  Try searching with a different username
                </Text>
              </View>
            )}
          </Card>
        ) : (
          <Card variant="outlined" padding={8} style={styles.emptyContainer}>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              Enter a username above to search for users
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
