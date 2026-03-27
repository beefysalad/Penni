import { AppPageHeader } from '@/components/navigation/app-page-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  InlineField,
  MonthlyBudgetGoalField,
  OptionRow,
  PreferenceSection,
  ToggleRow,
} from '@/features/settings/components/preferences-sections';
import {
  ALERT_SENSITIVITY_OPTIONS,
  CURRENCY_OPTIONS,
  START_OF_WEEK_OPTIONS,
  SUMMARY_DAY_OPTIONS,
} from '@/features/settings/lib/constants';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

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
                <MonthlyBudgetGoalField value={monthlyBudgetGoal} onChangeText={setMonthlyBudgetGoal} />
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
