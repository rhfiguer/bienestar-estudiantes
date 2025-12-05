import { ContentCard } from '@/components/ContentCard';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ContentItem } from '@/constants/data';
import { ContentService } from '@/services/content';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
    { id: '1', name: 'Salud Mental', color: '#FF6B6B' },
    { id: '2', name: 'Productividad', color: '#4ECDC4' },
    { id: '3', name: 'Técnicas de Estudio', color: '#45B7D1' },
    { id: '4', name: 'Habilidades Sociales', color: '#96CEB4' },
];

export default function SearchScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const data = await ContentService.getAllContent();
                setContent(data);
            } catch (error) {
                console.error(error);
                // Handle error
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const filteredData = content.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Buscar</Text>
                <View style={[styles.searchBar, { backgroundColor: theme.cardBackground }]}>
                    <Ionicons name="search" size={20} color={theme.secondaryText} />
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="¿Qué quieres aprender hoy?"
                        placeholderTextColor={theme.secondaryText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.categories}>
                <FlatList
                    horizontal
                    data={CATEGORIES}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContent}
                    renderItem={({ item }) => (
                        <Pressable
                            style={[
                                styles.categoryChip,
                                { backgroundColor: item.color, opacity: selectedCategory === item.name ? 1 : 0.7 },
                            ]}
                            onPress={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}>
                            <Text style={styles.categoryText}>{item.name}</Text>
                        </Pressable>
                    )}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.tint} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ContentCard item={item} isDark={isDark} />}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                            No se encontraron resultados
                        </Text>
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
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    categories: {
        marginBottom: 10,
    },
    categoriesContent: {
        paddingHorizontal: 20,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    categoryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
});
