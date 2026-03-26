import { AppPageHeader } from '@/components/navigation/app-page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';

const CURRENCY_OPTIONS = ['PHP', 'USD', 'SGD'] as const;
const START_OF_WEEK_OPTIONS = ['Monday', 'Sunday'] as const;
const SUMMARY_DAY_OPTIONS = ['Monday', 'Friday', 'Sunday'] as const;
const ALERT_SENSITIVITY_OPTIONS = ['Calm', 'Balanced', 'Strict'] as const;

export default function PreferencesScreen() {
  const [currency, setCurrency] = useState<(typeof CURRENCY_OPTIONS)[number]>('PHP');
  const [startOfWeek, setStartOfWeek] =
    useState<(typeof START_OF_WEEK_OPTIONS)[number]>('Monday');
  const [summaryDay, setSummaryDay] =
    useState<(typeof SUMMARY_DAY_OPTIONS)[number]>('Monday');
  const [alertSensitivity, setAlertSensitivity] =
    useState<(typeof ALERT_SENSITIVITY_OPTIONS)[number]>('Balanced');
  const [showWeeklySummary, setShowWeeklySummary] = useState(true);
  const [showAmountsOnHome, setShowAmountsOnHome] = useState(true);
  const [monthlyBudgetGoal, setMonthlyBudgetGoal] = useState('20000');

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <View className="mb-4">
            <Button
              variant="ghost"
              className="h-11 self-start rounded-full bg-[#111916] px-4"
              onPress={() => router.back()}>
              <Text className="text-sm font-semibold text-[#f4f7f5]">Back</Text>
            </Button>
          </View>

          <AppPageHeader
            eyebrow="App behavior"
            title="Preferences"
            subtitle="These settings are editable now and stay local on the device until we wire backend persistence."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <PreferenceSection
            label="Currency"
            description="Choose the default money format used across balances and budgeting.">
            <OptionRow
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={setCurrency}
              formatOption={(option) =>
                option === 'PHP' ? 'PHP (Philippine Peso)' : option
              }
            />
          </PreferenceSection>

          <PreferenceSection
            label="Week setup"
            description="This affects how weekly summaries and grouped views should feel in the app.">
            <View className="gap-4">
              <InlineField label="Start of week">
                <OptionRow
                  options={START_OF_WEEK_OPTIONS}
                  value={startOfWeek}
                  onChange={setStartOfWeek}
                />
              </InlineField>
              <InlineField label="Summary day">
                <OptionRow
                  options={SUMMARY_DAY_OPTIONS}
                  value={summaryDay}
                  onChange={setSummaryDay}
                />
              </InlineField>
            </View>
          </PreferenceSection>

          <PreferenceSection
            label="Budget behavior"
            description="Control how early Penni should call attention to spending drift.">
            <View className="gap-4">
              <InlineField label="Alert sensitivity">
                <OptionRow
                  options={ALERT_SENSITIVITY_OPTIONS}
                  value={alertSensitivity}
                  onChange={setAlertSensitivity}
                />
              </InlineField>
              <InlineField label="Monthly budget goal">
                <Input
                  value={monthlyBudgetGoal}
                  onChangeText={setMonthlyBudgetGoal}
                  keyboardType="number-pad"
                  placeholder="20000"
                  placeholderTextColor="#6d786f"
                  className="h-14 rounded-[18px] border-[#1d2a20] bg-[#111916] px-4 text-white"
                />
              </InlineField>
            </View>
          </PreferenceSection>

          <PreferenceSection
            label="Display"
            description="Small quality-of-life toggles for how the app should look on your device.">
            <View className="gap-3">
              <ToggleRow
                label="Weekly summary card"
                description="Show a weekly recap rhythm inside the app."
                value={showWeeklySummary}
                onValueChange={setShowWeeklySummary}
              />
              <ToggleRow
                label="Show amounts on home"
                description="Keep balances visible without hiding them behind an extra tap."
                value={showAmountsOnHome}
                onValueChange={setShowAmountsOnHome}
              />
            </View>
          </PreferenceSection>

          <View className="rounded-[24px] border border-dashed border-[#284034] bg-[#0c1510] p-5">
            <Text className="text-sm font-semibold text-[#f4f7f5]">Local only for now</Text>
            <Text className="mt-2 text-sm leading-6 text-[#7f8c86]">
              These controls are editable already, but they are not persisted to the backend yet.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PreferenceSection({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
      <Text className="text-[24px] font-semibold text-[#f4f7f5]">{label}</Text>
      <Text className="mt-2 text-[15px] leading-6 text-[#7f8c86]">{description}</Text>
      <View className="mt-5">{children}</View>
    </View>
  );
}

function InlineField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
        {label}
      </Text>
      {children}
    </View>
  );
}

function OptionRow<T extends string>({
  options,
  value,
  onChange,
  formatOption,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  formatOption?: (option: T) => string;
}) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = option === value;

        return (
          <Pressable
            key={option}
            className={`rounded-full px-4 py-3 ${isSelected ? 'bg-[#8bff62]' : 'bg-[#131b17]'}`}
            onPress={() => onChange(option)}>
            <Text
              className={`text-sm font-semibold ${isSelected ? 'text-[#07110a]' : 'text-[#7f8c86]'}`}>
              {formatOption ? formatOption(option) : option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-4 rounded-[22px] bg-[#131b17] px-4 py-4">
      <View className="flex-1">
        <Text className="text-base font-semibold text-[#f4f7f5]">{label}</Text>
        <Text className="mt-1 text-sm leading-6 text-[#7f8c86]">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2a332d', true: '#8bff62' }}
        thumbColor={value ? '#07110a' : '#d6dbd8'}
      />
    </View>
  );
}
