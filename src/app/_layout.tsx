import { Platform, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!loaded && !error) {
    return (
      <View style={styles.boot}>
        <Text style={styles.bootText}>Lifeswap</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <View style={styles.device}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: '#FFF6EE' },
            }}
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const web = Platform.OS === 'web';

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: '#241433', alignItems: 'center', justifyContent: 'center' },
  bootText: { color: '#FFF6EE', fontSize: 42, fontWeight: '700' },
  shell: {
    flex: 1,
    backgroundColor: web ? '#241433' : '#FFF6EE',
    alignItems: 'center',
  },
  device: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFF6EE',
    overflow: 'hidden',
    ...(web
      ? {
          boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        }
      : null),
  },
});
