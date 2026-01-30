import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut, updateProfile } from 'firebase/auth';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../firebaseConfig';

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const { user } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Router will automatically redirect due to AuthContext
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const [isEditing, setIsEditing] = React.useState(false);
    const [newName, setNewName] = React.useState(user?.displayName || '');


    const handleUpdateName = async () => {
        if (!user || !newName.trim()) return;
        try {
            await updateProfile(user, { displayName: newName });
            setIsEditing(false);
            Alert.alert('Éxito', 'Nombre actualizado correctamente');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Perfil</Text>
            </View>

            <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                    {user?.photoURL ? (
                        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                    ) : (
                        <Ionicons name="person-circle" size={100} color={theme.secondaryText} />
                    )}
                </View>

                {isEditing ? (
                    <View style={styles.editContainer}>
                        <TextInput
                            style={[styles.editInput, { color: theme.text, borderColor: theme.secondaryText }]}
                            value={newName}
                            onChangeText={setNewName}
                            autoFocus
                        />
                        <View style={styles.editButtons}>
                            <Pressable onPress={() => setIsEditing(false)} style={styles.editButton}>
                                <Ionicons name="close-circle" size={30} color="#FF6B6B" />
                            </Pressable>
                            <Pressable onPress={handleUpdateName} style={styles.editButton}>
                                <Ionicons name="checkmark-circle" size={30} color="#4ECDC4" />
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <View style={styles.nameContainer}>
                        <Text style={[styles.name, { color: theme.text }]}>
                            {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
                        </Text>
                        <Pressable onPress={() => {
                            setNewName(user?.displayName || '');
                            setIsEditing(true);
                        }}>
                            <Ionicons name="pencil" size={20} color={theme.tint} style={{ marginLeft: 8 }} />
                        </Pressable>
                    </View>
                )}

                <Text style={[styles.email, { color: theme.secondaryText }]}>{user?.email}</Text>
            </View>

            <View style={styles.menu}>

                <MenuItem icon="settings-outline" label="Configuración" theme={theme} />
                <MenuItem icon="notifications-outline" label="Notificaciones" theme={theme} />
                <MenuItem icon="help-circle-outline" label="Ayuda" theme={theme} />

                <Pressable
                    style={[styles.menuItem, { borderBottomColor: theme.cardBackground }]}
                    onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
                    <Text style={[styles.menuLabel, { color: "#FF6B6B" }]}>
                        Cerrar Sesión
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const MenuItem = ({ icon, label, theme, isDestructive = false }: any) => (
    <Pressable style={[styles.menuItem, { borderBottomColor: theme.cardBackground }]}>
        <Ionicons name={icon} size={24} color={isDestructive ? '#FF6B6B' : theme.text} />
        <Text style={[styles.menuLabel, { color: isDestructive ? '#FF6B6B' : theme.text }]}>
            {label}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
    </Pressable>
);

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
    profileInfo: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarContainer: {
        marginBottom: 10,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    editInput: {
        fontSize: 24,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        minWidth: 150,
        textAlign: 'center',
    },
    editButtons: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    editButton: {
        marginLeft: 8,
    },
    email: {
        fontSize: 16,
    },
    menu: {
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        marginLeft: 16,
    },
});
