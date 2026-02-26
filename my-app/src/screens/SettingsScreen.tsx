import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import type { TranslationDictionary } from '../i18n/translations';
import type { ThemeColors } from '../theme/palette';
import type { Language, ThemeMode } from '../types/app';

type SettingsScreenProps = {
  colors: ThemeColors;
  t: TranslationDictionary;
  language: Language;
  themeMode: ThemeMode;
  userName: string;
  onBack: () => void;
  onSelectLanguage: (language: Language) => void;
  onToggleTheme: (isDark: boolean) => void;
  onChangeUserName: (value: string) => void;
};

export function SettingsScreen({
  colors,
  t,
  language,
  themeMode,
  userName,
  onBack,
  onSelectLanguage,
  onToggleTheme,
  onChangeUserName,
}: SettingsScreenProps) {
  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
    },
    textButton: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    textButtonLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    textButtonPrimary: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    textButtonPrimaryLabel: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    rowGap: {
      flexDirection: 'row',
      gap: 8,
    },
    settingsBlock: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      gap: 12,
      marginHorizontal: 16,
      marginTop: 10,
    },
    inputLabel: {
      color: colors.secondaryText,
      fontSize: 13,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.background,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{t.settings}</Text>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>{t.back}</Text>
        </Pressable>
      </View>

      <View style={styles.settingsBlock}>
        <Text style={styles.inputLabel}>{t.userName}</Text>
        <TextInput
          value={userName}
          onChangeText={onChangeUserName}
          style={styles.input}
          placeholder={t.userName}
          placeholderTextColor={colors.secondaryText}
        />

        <View style={styles.settingRow}>
          <Text style={styles.inputLabel}>{t.language}</Text>
          <View style={styles.rowGap}>
            <Pressable
              style={language === 'ru' ? styles.textButtonPrimary : styles.textButton}
              onPress={() => onSelectLanguage('ru')}
            >
              <Text
                style={
                  language === 'ru'
                    ? styles.textButtonPrimaryLabel
                    : styles.textButtonLabel
                }
              >
                RU
              </Text>
            </Pressable>
            <Pressable
              style={language === 'en' ? styles.textButtonPrimary : styles.textButton}
              onPress={() => onSelectLanguage('en')}
            >
              <Text
                style={
                  language === 'en'
                    ? styles.textButtonPrimaryLabel
                    : styles.textButtonLabel
                }
              >
                EN
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.inputLabel}>
            {themeMode === 'dark' ? t.darkTheme : t.lightTheme}
          </Text>
          <Switch value={themeMode === 'dark'} onValueChange={onToggleTheme} />
        </View>
      </View>
    </>
  );
}
