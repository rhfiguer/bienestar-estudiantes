import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ContentType } from '@/constants/data';
import { ContentService } from '@/services/content';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const CATEGORIES = ['Salud Mental', 'Productividad', 'Técnicas de Estudio', 'Habilidades Sociales'];
const TYPES: ContentType[] = ['audio', 'video', 'text'];

export default function UploadScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [type, setType] = useState<ContentType>('text');
    const [body, setBody] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [contentUri, setContentUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const pickContent = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            setContentUri(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!title || !author || !imageUri) {
            Alert.alert('Error', 'Por favor completa los campos requeridos e imagen');
            return;
        }

        if (type !== 'text' && !contentUri) {
            Alert.alert('Error', 'Por favor selecciona el archivo de audio/video');
            return;
        }

        setLoading(true);
        try {
            // 1. Upload Image
            const imageUrl = await ContentService.uploadFile(
                imageUri,
                `images/${Date.now()}_${title.replace(/\s/g, '_')}`
            );

            let contentUrl = '';
            // 2. Upload Content (if audio/video)
            if (type !== 'text' && contentUri) {
                contentUrl = await ContentService.uploadFile(
                    contentUri,
                    `${type}s/${Date.now()}_${title.replace(/\s/g, '_')}`
                );
            }

            // 3. Save to Firestore
            const newItem: any = {
                title,
                author,
                category,
                type,
                imageUrl,
            };

            if (type !== 'text') {
                newItem.contentUrl = contentUrl;
                newItem.duration = '5:00';
            }

            if (type === 'text') {
                newItem.body = body;
            }

            await ContentService.addContent(newItem);

            Alert.alert('Éxito', 'Contenido subido correctamente');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Subir Contenido</Text>

            <View style={styles.form}>
                <Text style={[styles.label, { color: theme.secondaryText }]}>Título</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Título del contenido"
                    placeholderTextColor={theme.secondaryText}
                />

                <Text style={[styles.label, { color: theme.secondaryText }]}>Autor</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                    value={author}
                    onChangeText={setAuthor}
                    placeholder="Nombre del autor"
                    placeholderTextColor={theme.secondaryText}
                />

                <Text style={[styles.label, { color: theme.secondaryText }]}>Tipo</Text>
                <View style={styles.row}>
                    {TYPES.map((t) => (
                        <Pressable
                            key={t}
                            style={[
                                styles.chip,
                                { backgroundColor: type === t ? theme.tint : theme.cardBackground },
                            ]}
                            onPress={() => setType(t)}>
                            <Text style={{ color: type === t ? '#fff' : theme.text }}>{t.toUpperCase()}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={[styles.label, { color: theme.secondaryText }]}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
                    {CATEGORIES.map((c) => (
                        <Pressable
                            key={c}
                            style={[
                                styles.chip,
                                { backgroundColor: category === c ? theme.tint : theme.cardBackground },
                            ]}
                            onPress={() => setCategory(c)}>
                            <Text style={{ color: category === c ? '#fff' : theme.text }}>{c}</Text>
                        </Pressable>
                    ))}
                </ScrollView>

                <Text style={[styles.label, { color: theme.secondaryText }]}>Imagen de Portada</Text>
                <Pressable onPress={pickImage} style={[styles.uploadBox, { borderColor: theme.secondaryText }]}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <Ionicons name="image" size={40} color={theme.secondaryText} />
                            <Text style={{ color: theme.secondaryText }}>Seleccionar Imagen</Text>
                        </View>
                    )}
                </Pressable>

                {type === 'text' ? (
                    <>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>Contenido (Texto)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            value={body}
                            onChangeText={setBody}
                            multiline
                            placeholder="Escribe el contenido aquí..."
                            placeholderTextColor={theme.secondaryText}
                        />
                    </>
                ) : (
                    <>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>Archivo {type === 'audio' ? 'de Audio' : 'de Video'}</Text>
                        <Pressable onPress={pickContent} style={[styles.uploadBox, { borderColor: theme.secondaryText }]}>
                            {contentUri ? (
                                <View style={styles.uploadPlaceholder}>
                                    <Ionicons name="checkmark-circle" size={40} color={theme.tint} />
                                    <Text style={{ color: theme.text }}>Archivo seleccionado</Text>
                                </View>
                            ) : (
                                <View style={styles.uploadPlaceholder}>
                                    <Ionicons name={type === 'audio' ? 'musical-note' : 'videocam'} size={40} color={theme.secondaryText} />
                                    <Text style={{ color: theme.secondaryText }}>Seleccionar Archivo</Text>
                                </View>
                            )}
                        </Pressable>
                    </>
                )}

                <Pressable
                    style={[styles.button, { backgroundColor: theme.tint }]}
                    onPress={handleUpload}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Publicar Contenido</Text>
                    )}
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 40,
    },
    form: {
        gap: 16,
        paddingBottom: 100,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
    },
    input: {
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    uploadBox: {
        height: 150,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    uploadPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
