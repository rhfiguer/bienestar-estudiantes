
import { ContentCard } from '@/components/ContentCard';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useFavorites } from '@/context/FavoritesContext';
import { ContentService } from '@/services/content';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LibraryScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const { favorites } = useFavorites();
    const [favoriteItems, setFavoriteItems] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const allContent = await ContentService.getAllContent();
                const favs = allContent.filter(item => favorites.includes(item.id));
                setFavoriteItems(favs);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setLoading(false);
            }
        };

        if (favorites.length > 0) {
            fetchFavorites();
        } else {
            setFavoriteItems([]);
            setLoading(false);
        }
    }, [favorites]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Tu Biblioteca</Text>
            </View>

            {loading ? (
                <View style={styles.emptyContainer}>
                    <Text style={{ color: theme.secondaryText }}>Cargando...</Text>
                </View>
            ) : (
                <FlatList
                    data={favoriteItems}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ContentCard item={item} isDark={isDark} />}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                                Aún no tienes favoritos.
                            </Text>
                            <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
                                Explora el contenido y guarda lo que más te guste.
                            </Text>
                        </View>
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
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
    },
});
