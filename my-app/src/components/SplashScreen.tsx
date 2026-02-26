import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TranslationDictionary } from '../i18n/translations';
import type { ThemeColors } from '../theme/palette';

type SplashScreenProps = {
  t: TranslationDictionary;
  colors: ThemeColors;
  isDark: boolean;
};

export function SplashScreen({ t, colors, isDark }: SplashScreenProps) {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 10,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>
        {t.splashTitle}
      </Text>
      <Text style={{ color: colors.secondaryText, fontSize: 14 }}>
        {t.splashSubtitle}
      </Text>
      <ActivityIndicator size="large" color={colors.primary} />
    </SafeAreaView>
  );
}
