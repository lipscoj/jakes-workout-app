import { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts, radii, spacing } from './theme';
import { useResponsiveLayout } from './responsive';

export function Screen({
  children,
  contentContainerStyle,
  chrome = 'default',
}: {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  chrome?: 'default' | 'dense';
}) {
  const { isDesktop, isWideDesktop } = useResponsiveLayout();

  return (
    <View style={styles.screenShell}>
      <View style={styles.screenBackdrop}>
        <LinearGradient
          colors={[colors.background, colors.backgroundDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.orbLarge} />
        <View style={styles.orbSmall} />
        <View style={styles.topographyRingOne} />
        <View style={styles.topographyRingTwo} />
        <View style={styles.diagonalBand} />
      </View>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.screenContent,
          chrome === 'dense' && styles.screenContentDense,
          isDesktop && styles.screenContentDesktop,
          isWideDesktop && styles.screenContentWide,
          contentContainerStyle,
        ]}
        contentInsetAdjustmentBehavior="automatic"
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function Card({
  children,
  tone = 'default',
  style,
}: {
  children: ReactNode;
  tone?: 'default' | 'muted' | 'accent' | 'dark';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.card,
        tone === 'muted' && styles.cardMuted,
        tone === 'accent' && styles.cardAccent,
        tone === 'dark' && styles.cardDark,
        style,
      ]}
    >
      <View style={styles.cardEdge} />
      {children}
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function HeroTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.heroTitle}>{children}</Text>;
}

export function Subtitle({ children }: { children: ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function BodyText({
  children,
  muted = false,
  style,
}: {
  children: ReactNode;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.bodyText, muted && styles.bodyMuted, style]}>{children}</Text>;
}

export function Pill({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'primary' | 'warning' | 'ghost';
}) {
  return (
    <View
      style={[
        styles.pill,
        tone === 'primary' && styles.pillPrimary,
        tone === 'warning' && styles.pillWarning,
        tone === 'ghost' && styles.pillGhost,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          tone === 'primary' && styles.pillTextPrimary,
          tone === 'warning' && styles.pillTextWarning,
          tone === 'ghost' && styles.pillTextGhost,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function StatChip({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'accent';
}) {
  return (
    <View style={[styles.statChip, tone === 'accent' && styles.statChipAccent]}>
      <Text style={[styles.statLabel, tone === 'accent' && styles.statLabelAccent]}>{label}</Text>
      <Text style={[styles.statValue, tone === 'accent' && styles.statValueAccent]}>{value}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  tone = 'primary',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        tone === 'secondary' && styles.buttonSecondary,
        tone === 'danger' && styles.buttonDanger,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      {tone === 'primary' ? <View style={styles.buttonGlow} /> : null}
      <Text
        style={[
          styles.buttonText,
          tone === 'secondary' && styles.buttonSecondaryText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Input({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  label,
}: {
  value: string;
  onChangeText: (nextValue: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
  label?: string;
}) {
  return (
    <View style={styles.inputGroup}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item} style={styles.listRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function HeroPanel({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  const { isDesktop } = useResponsiveLayout();

  return (
    <View style={[styles.heroPanel, isDesktop && styles.heroPanelDesktop]}>
      <LinearGradient
        colors={['#173629', '#234D3C', '#C45F2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroGrain} />
      <View style={[styles.heroInner, isDesktop && styles.heroInnerDesktop]}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <HeroTitle>{title}</HeroTitle>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>
        {children}
      </View>
    </View>
  );
}

export function LinkTag({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <View style={styles.linkTag}>
      <Text style={styles.linkTagText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenBackdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  screenContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },
  screenContentDense: {
    paddingTop: spacing.sm,
  },
  screenContentDesktop: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
  screenContentWide: {
    maxWidth: 1400,
  },
  orbLarge: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(31, 75, 61, 0.13)',
  },
  orbSmall: {
    position: 'absolute',
    bottom: 140,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(185, 90, 42, 0.10)',
  },
  topographyRingOne: {
    position: 'absolute',
    top: 40,
    left: -20,
    width: 220,
    height: 220,
    borderRadius: 220,
    borderWidth: 1,
    borderColor: 'rgba(137, 100, 44, 0.18)',
  },
  topographyRingTwo: {
    position: 'absolute',
    top: 62,
    left: 10,
    width: 170,
    height: 170,
    borderRadius: 170,
    borderWidth: 1,
    borderColor: 'rgba(137, 100, 44, 0.16)',
  },
  diagonalBand: {
    position: 'absolute',
    top: '45%',
    left: -120,
    width: '150%',
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ rotate: '-10deg' }],
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: 'hidden',
    shadowColor: '#7B6850',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  cardMuted: {
    backgroundColor: colors.cardStrong,
  },
  cardAccent: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.borderStrong,
  },
  cardDark: {
    backgroundColor: colors.primaryDeep,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(31, 75, 61, 0.15)',
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: fonts.displaySemiBold,
    color: colors.text,
  },
  heroTitle: {
    fontSize: 44,
    lineHeight: 46,
    fontFamily: fonts.displayBold,
    color: colors.white,
    maxWidth: 280,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSoft,
    fontFamily: fonts.body,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.2,
    color: colors.text,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.82)',
    fontFamily: fonts.bodyBold,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    fontFamily: fonts.body,
  },
  bodyMuted: {
    color: colors.mutedText,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(137, 100, 44, 0.18)',
  },
  pillPrimary: {
    backgroundColor: colors.primaryMuted,
    borderColor: 'rgba(31, 75, 61, 0.18)',
  },
  pillWarning: {
    backgroundColor: colors.accentSoft,
  },
  pillGhost: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  pillText: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.gold,
  },
  pillTextPrimary: {
    color: colors.primary,
  },
  pillTextWarning: {
    color: colors.warning,
  },
  pillTextGhost: {
    color: colors.white,
  },
  statChip: {
    flex: 1,
    minWidth: 120,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    gap: spacing.xs,
  },
  statChipAccent: {
    backgroundColor: colors.card,
    borderColor: colors.borderStrong,
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: fonts.bodyBold,
  },
  statLabelAccent: {
    color: colors.mutedText,
  },
  statValue: {
    fontSize: 19,
    lineHeight: 22,
    color: colors.white,
    fontFamily: fonts.displaySemiBold,
  },
  statValueAccent: {
    color: colors.text,
  },
  button: {
    minHeight: 50,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  buttonSecondary: {
    backgroundColor: colors.cardStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.93,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.3,
  },
  buttonSecondaryText: {
    color: colors.text,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: 11,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.mutedText,
    fontFamily: fonts.bodyBold,
  },
  input: {
    minHeight: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  list: {
    gap: spacing.xs,
  },
  listRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  bullet: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  heroPanel: {
    minHeight: 280,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: '#4F3A21',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  heroPanelDesktop: {
    minHeight: 340,
  },
  heroGrain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroInner: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
    gap: spacing.md,
  },
  heroInnerDesktop: {
    padding: spacing.xxxl,
    justifyContent: 'flex-end',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: fonts.body,
    maxWidth: 320,
  },
  linkTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: 'rgba(31, 75, 61, 0.18)',
  },
  linkTagText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.bodyBold,
  },
});
