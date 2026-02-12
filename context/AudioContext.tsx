import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AudioContextType {
    currentSound: Audio.Sound | null;
    setSound: (sound: Audio.Sound | null) => Promise<void>;
    stopCurrentSound: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType>({
    currentSound: null,
    setSound: async () => { },
    stopCurrentSound: async () => { },
});

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentSound, setCurrentSoundState] = useState<Audio.Sound | null>(null);

    // Helper to properly unload sound when replacing it
    const setSound = async (newSound: Audio.Sound | null) => {
        if (currentSound && currentSound !== newSound) {
            console.log("Unloading previous sound via Context");
            try {
                const status = await currentSound.getStatusAsync();
                if (status.isLoaded) {
                    await currentSound.stopAsync();
                    await currentSound.unloadAsync();
                }
            } catch (error) {
                console.log("Error unloading previous sound:", error);
            }
        }
        setCurrentSoundState(newSound);
    };

    const stopCurrentSound = async () => {
        if (currentSound) {
            try {
                const status = await currentSound.getStatusAsync();
                if (status.isLoaded) {
                    await currentSound.stopAsync();
                    // Optionally reset or unload? For "Stop", pause + seek 0 is usually enough,
                    // but if we want to clear resources, we might unload.
                    // For now, let's just stop and seek to 0.
                    await currentSound.setPositionAsync(0);
                }
            } catch (error) {
                console.log("Error stopping current sound:", error);
            }
        }
    };

    // Cleanup on unmount (of the provider, essentially app close)
    useEffect(() => {
        return () => {
            if (currentSound) {
                currentSound.unloadAsync();
            }
        };
    }, [currentSound]);

    return (
        <AudioContext.Provider value={{ currentSound, setSound, stopCurrentSound }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => useContext(AudioContext);
