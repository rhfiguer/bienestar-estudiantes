import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function LoginScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingresa email y contraseña');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Error de inicio de sesión', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Bienvenido de nuevo</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Inicia sesión para continuar</Text>

            <View style={styles.form}>
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

                <Pressable
                    style={[styles.button, { backgroundColor: theme.tint }]}
                    onPress={handleLogin}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Iniciar Sesión</Text>
                    )}
                </Pressable>

                <Link href="/(auth)/register" asChild>
                    <Pressable style={styles.linkButton}>
                        <Text style={[styles.linkText, { color: theme.tint }]}>
                            ¿No tienes cuenta? Regístrate
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
