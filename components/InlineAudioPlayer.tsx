import { useColorScheme } from '@/components/useColorScheme';
import { useAudio } from '@/context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface InlineAudioPlayerProps {
    audioUri: string;
    style?: any;
}

export default function InlineAudioPlayer({ audioUri, style }: InlineAudioPlayerProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setSound: setGlobalSound, currentSound: globalSound } = useAudio();

    // Theme colors
    const themeTextColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const themeBgColor = isDark ? '#2C2C2C' : '#FFFFFF';
    const themeBorderColor = isDark ? '#404040' : '#EDEDED';
    const themeSecondaryText = isDark ? '#A0A0A0' : '#828282';
    const activeColor = isDark ? '#FFFFFF' : '#1A1A1A';

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Scrubber ref
    const scrubberRef = useRef<View>(null);
    const [scrubberWidth, setScrubberWidth] = useState(0);

    useEffect(() => {
        loadAudio();
        return () => {
            // Unload on unmount to stop playing on exit
            if (sound) {
                sound.unloadAsync();
                // We don't necessarily need to clear global sound if we are navigating to another player
                // which will overwrite it. But if we go back to menu, it's good practice.
                // However, since 'sound' is captured in closure, we rely on the object reference.
            }
        };
    }, [audioUri]);

    // Effect to track external stopping (e.g. by another player taking over)
    useEffect(() => {
        // If global sound changes and it's NOT our sound, we should probably know?
        // Actually, if Context unloads our sound, our onPlaybackStatusUpdate should receive a generic/unloaded status or stop firing?
        // Expo AV: unloadAsync() makes the object invalid.
        // We might want to check if we are still the global sound?
        // For now, relies on setSound(new) unloading the old one.
    }, [globalSound]);

    const loadAudio = async () => {
        setIsLoading(true);
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false, // Stop when app is backgrounded? Or keep? User said "when I leave" (app or screen?). Assumed screen.
            });

            const { sound: newSound, status } = await Audio.Sound.createAsync(
                { uri: audioUri },
                { shouldPlay: false, isLooping: isLooping },
                onPlaybackStatusUpdate
            );

            setSound(newSound);

            // Register with global context (this stops any previous audio)
            await setGlobalSound(newSound);

            if (status.isLoaded) {
                setDuration(status.durationMillis || 0);
            }
        } catch (error) {
            console.error("Error loading audio", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
            setPosition(status.positionMillis);
            setIsPlaying(status.isPlaying);
            setIsLooping(status.isLooping);

            if (status.didJustFinish && !status.isLooping) {
                setIsPlaying(false);
                // sound?.setPositionAsync(0); // Optional auto-reset
            }
        } else {
            // Unloaded
            if (status.error) {
                console.log(`FATAL PLAYER ERROR: ${status.error}`);
            }
        }
    };

    const togglePlayPause = async () => {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            if (position >= duration && duration > 0) {
                await sound.setPositionAsync(0);
            }
            await sound.playAsync();
        }
    };

    const stopAudio = async () => {
        if (!sound) return;
        try {
            await sound.stopAsync();
            await sound.setPositionAsync(0);
            setIsPlaying(false);
        } catch (error) {
            console.error("Error stopping audio", error);
        }
    };

    const skip = async (seconds: number) => {
        if (!sound) return;
        const newPosition = position + seconds * 1000;
        await sound.setPositionAsync(Math.max(0, Math.min(newPosition, duration)));
    };

    const toggleLoop = async () => {
        if (!sound) return;
        await sound.setIsLoopingAsync(!isLooping);
        setIsLooping(!isLooping);
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleScrubberPress = async (event: any) => {
        if (!sound || duration === 0 || scrubberWidth === 0) return;
        const locationX = event.nativeEvent.locationX;
        const percentage = locationX / scrubberWidth;
        const newPosition = percentage * duration;
        await sound.setPositionAsync(newPosition);
    };

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: themeBgColor,
                borderColor: themeBorderColor
            },
            style
        ]}>
            {/* Play/Pause Button */}
            <Pressable
                onPress={togglePlayPause}
                style={styles.playButton}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={activeColor} />
                ) : (
                    <Ionicons
                        name={isPlaying ? "pause-outline" : "play-outline"}
                        size={32}
                        color={activeColor}
                    />
                )}
            </Pressable>

            {/* Stop Button (NEW) */}
            <Pressable
                onPress={stopAudio}
                style={[styles.iconButton, { marginRight: 8 }]}
                disabled={isLoading}
            >
                <Ionicons name="square" size={20} color={activeColor} />
            </Pressable>

            {/* Skip Controls */}
            <View style={styles.controlsGroup}>
                <Pressable onPress={() => skip(-15)} style={styles.iconButton}>
                    <Ionicons name="play-back-outline" size={22} color={activeColor} />
                    <Text style={[styles.tinyText, { color: activeColor }]}>15</Text>
                </Pressable>
                <Pressable onPress={() => skip(15)} style={styles.iconButton}>
                    <Ionicons name="play-forward-outline" size={22} color={activeColor} />
                    <Text style={[styles.tinyText, { color: activeColor }]}>15</Text>
                </Pressable>
            </View>

            {/* Scrubber Area */}
            <View
                style={styles.scrubberContainer}
                onLayout={(e) => setScrubberWidth(e.nativeEvent.layout.width)}
            >
                {/* Visual Track */}
                <Pressable
                    style={styles.scrubberTouchArea}
                    onPress={handleScrubberPress}
                    hitSlop={{ top: 10, bottom: 10 }}
                >
                    {/* Background Line */}
                    <View style={[styles.scrubberLine, { backgroundColor: '#EDEDED' }]} />
                    {/* Progress Line */}
                    <View
                        style={[
                            styles.scrubberProgress,
                            {
                                width: `${progressPercent}%`,
                                backgroundColor: activeColor
                            }
                        ]}
                    />
                    {/* Handle */}
                    <View
                        style={[
                            styles.scrubberHandle,
                            {
                                left: `${progressPercent}%`,
                                backgroundColor: activeColor,
                                marginLeft: -4
                            }
                        ]}
                    />
                </Pressable>
            </View>

            {/* Time Display */}
            <Text style={[styles.timeText, { color: themeSecondaryText }]}>
                {formatTime(position)} / {formatTime(duration)}
            </Text>

            {/* Loop Button */}
            <Pressable onPress={toggleLoop} style={[styles.iconButton, { marginLeft: 10 }]}>
                <Ionicons
                    name="infinite-outline"
                    size={20}
                    color={isLooping ? activeColor : themeSecondaryText}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 72,
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 12, // Reduced padding slightly to fit Stop button
        marginVertical: 16,
        width: '100%',
    },
    playButton: {
        width: 44, // Slightly smaller
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4, // Reduce margin
    },
    controlsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6, // Reduce gap
        marginRight: 10, // Reduce margin
    },
    iconButton: {
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tinyText: {
        fontSize: 10,
        fontFamily: 'Inter_600SemiBold',
        position: 'absolute',
        bottom: -2,
        fontWeight: '600',
    },
    scrubberContainer: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
    },
    scrubberTouchArea: {
        height: 40,
        justifyContent: 'center',
    },
    scrubberLine: {
        height: 1,
        width: '100%',
        position: 'absolute',
        borderRadius: 1,
    },
    scrubberProgress: {
        height: 1,
        position: 'absolute',
        borderRadius: 1,
    },
    scrubberHandle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        position: 'absolute',
        top: '50%',
        marginTop: -6,
    },
    timeText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12, // Slightly smaller
        marginLeft: 8,
        fontVariant: ['tabular-nums'],
    }
});
