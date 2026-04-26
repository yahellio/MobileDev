import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { TranslationDictionary } from '../i18n/translations';
import type { ThemeColors } from '../theme/palette';
import type { Language } from '../types/app';

type AuthScreenProps = {
  colors: ThemeColors;
  t: TranslationDictionary;
  language: Language;
  firebaseAvailable: boolean;
  submitting: boolean;
  errorMessage: string | null;
  onSignIn: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
};

export function AuthScreen({
  colors,
  t,
  language,
  firebaseAvailable,
  submitting,
  errorMessage,
  onSignIn,
  onRegister,
}: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    inner: {
      paddingHorizontal: 20,
      paddingTop: 48,
      paddingBottom: 32,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '700',
      marginBottom: 8,
    },
    hint: {
      color: colors.secondaryText,
      fontSize: 14,
      marginBottom: 24,
    },
    inputLabel: {
      color: colors.secondaryText,
      fontSize: 13,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: colors.text,
      backgroundColor: colors.card,
      marginBottom: 14,
    },
    error: {
      color: '#c62828',
      fontSize: 14,
      marginBottom: 12,
    },
    configError: {
      color: colors.secondaryText,
      fontSize: 14,
      lineHeight: 20,
    },
    row: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
    },
    textButton: {
      flex: 1,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      alignItems: 'center',
    },
    textButtonLabel: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    textButtonPrimary: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    textButtonPrimaryLabel: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
    },
  });

  if (!firebaseAvailable) {
    return (
      <ScrollView
        contentContainerStyle={[styles.inner, { flexGrow: 1, justifyContent: 'center' }]}
        style={styles.root}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Giga Tracker</Text>
        <Text style={styles.configError}>{t.authFirebaseRequired}</Text>
      </ScrollView>
    );
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  return (
    <ScrollView
      contentContainerStyle={styles.inner}
      style={styles.root}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{t.authTitle}</Text>
      <Text style={styles.hint}>{language === 'ru' ? 'Войдите или создайте аккаунт' : 'Sign in or create an account'}</Text>

      <Text style={styles.inputLabel}>{t.authEmail}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="user@example.com"
        placeholderTextColor={colors.secondaryText}
        editable={!submitting}
      />

      <Text style={styles.inputLabel}>{t.authPassword}</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        placeholder="••••••••"
        placeholderTextColor={colors.secondaryText}
        editable={!submitting}
        onSubmitEditing={() => {
          if (canSubmit) {
            onSignIn(email, password);
          }
        }}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {submitting ? <ActivityIndicator color={colors.primary} style={{ marginBottom: 8 }} /> : null}

      <View style={styles.row}>
        <Pressable
          style={styles.textButton}
          onPress={() => onRegister(email, password)}
          disabled={!canSubmit}
        >
          <Text style={styles.textButtonLabel}>{t.authSignUp}</Text>
        </Pressable>
        <Pressable
          style={styles.textButtonPrimary}
          onPress={() => onSignIn(email, password)}
          disabled={!canSubmit}
        >
          <Text style={styles.textButtonPrimaryLabel}>{t.authSignIn}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
