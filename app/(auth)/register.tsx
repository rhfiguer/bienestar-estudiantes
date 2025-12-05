import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function RegisterScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });

            // Optionally create user profile in Firestore here
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Error de registro', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Crear Cuenta</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Únete a nuestra comunidad</Text>

            <View style={styles.form}>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                    placeholder="Nombre"
                    placeholderTextColor={theme.secondaryText}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                    placeholder="Email"
                    placeholderTextColor={theme.secondaryText}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                    placeholder="Contraseña"
                    placeholderTextColor={theme.secondaryText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                    placeholder="Confirmar Contraseña"
                    placeholderTextColor={theme.secondaryText}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <Pressable
                    style={[styles.button, { backgroundColor: theme.tint }]}
                    onPress={handleRegister}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Registrarse</Text>
                    )}
                </Pressable>

                <Link href="/(auth)/login" asChild>
                    <Pressable style={styles.linkButton}>
                        <Text style={[styles.linkText, { color: theme.tint }]}>
                            ¿Ya tienes cuenta? Inicia Sesión
                        </Text>
                    </Pressable>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 40,
    },
    form: {
        gap: 16,
    },
    input: {
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
