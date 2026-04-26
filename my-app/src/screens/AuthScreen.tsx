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

type AuthMode = 'signin' | 'register';

type AuthScreenProps = {
  colors: ThemeColors;
  t: TranslationDictionary;
  firebaseAvailable: boolean;
  submitting: boolean;
  errorMessage: string | null;
  onSignIn: (email: string, password: string) => void;
  onRegister: (email: string, password: string, displayName: string) => void;
};

export function AuthScreen({
  colors,
  t,
  firebaseAvailable,
  submitting,
  errorMessage,
  onSignIn,
  onRegister,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [displayName, setDisplayName] = useState('');
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
      marginBottom: 20,
    },
    modeRow: {
      flexDirection: 'row',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: 20,
    },
    modePill: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    modePillActive: {
      backgroundColor: colors.primary,
    },
    modePillLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    modePillLabelActive: {
      color: '#fff',
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
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    primaryButtonDisabled: {
      opacity: 0.5,
    },
    primaryButtonLabel: {
      color: '#fff',
      fontSize: 16,
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

  const isRegister = mode === 'register';
  const canSignIn = email.trim().length > 0 && password.length > 0 && !submitting;
  const canRegister =
    displayName.trim().length > 0 && email.trim().length > 0 && password.length > 0 && !submitting;
  const canSubmit = isRegister ? canRegister : canSignIn;

  return (
    <ScrollView
      contentContainerStyle={styles.inner}
      style={styles.root}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{t.authTitle}</Text>
      <Text style={styles.hint}>{isRegister ? t.authHintRegister : t.authHintSignIn}</Text>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modePill, mode === 'signin' && styles.modePillActive]}
          onPress={() => setMode('signin')}
          disabled={submitting}
        >
          <Text
            style={[styles.modePillLabel, mode === 'signin' && styles.modePillLabelActive]}
            numberOfLines={1}
          >
            {t.authModeSignIn}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modePill, mode === 'register' && styles.modePillActive]}
          onPress={() => setMode('register')}
          disabled={submitting}
        >
          <Text
            style={[styles.modePillLabel, mode === 'register' && styles.modePillLabelActive]}
            numberOfLines={1}
          >
            {t.authModeRegister}
          </Text>
        </Pressable>
      </View>

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
      />

      {isRegister ? (
        <>
          <Text style={styles.inputLabel}>{t.authDisplayName}</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
            autoComplete="name"
            textContentType="name"
            placeholder={t.authDisplayNamePlaceholder}
            placeholderTextColor={colors.secondaryText}
            editable={!submitting}
          />
        </>
      ) : null}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {submitting ? <ActivityIndicator color={colors.primary} style={{ marginBottom: 8 }} /> : null}

      <Pressable
        style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
        onPress={() => {
          if (isRegister) {
            onRegister(email, password, displayName);
          } else {
            onSignIn(email, password);
          }
        }}
        disabled={!canSubmit}
      >
        <Text style={styles.primaryButtonLabel}>{isRegister ? t.authSignUp : t.authSignIn}</Text>
      </Pressable>
    </ScrollView>
  );
}
