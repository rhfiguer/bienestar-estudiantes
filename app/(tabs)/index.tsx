import { ContentCard } from '@/components/ContentCard';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ContentItem } from '@/constants/data';
import { useAuth } from '@/context/AuthContext';
import { ContentService } from '@/services/content';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { user } = useAuth();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContent = async () => {
    try {
      const data = await ContentService.getAllContent();
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
      // Handle error appropriately (e.g., show error message)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContent();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.text }]}>
          Hola, {user?.displayName || user?.email?.split('@')[0] || 'Estudiante'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>¿Cómo te sientes hoy?</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : (
        <FlatList
          data={content}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContentCard item={item} isDark={isDark} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
          }
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Destacado para ti</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // Space for tab bar
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
