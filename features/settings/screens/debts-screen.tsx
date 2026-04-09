import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useDebtsQuery, useDeleteDebtMutation } from '@/features/finance/hooks/use-debts-query';
import { formatCurrency, formatShortDate } from '@/features/finance/lib/formatters';
import type { Debt, DebtDirection } from '@/features/finance/lib/finance.types';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowDownLeftIcon, ArrowUpRightIcon, HandCoinsIcon, PlusIcon, Trash2Icon } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { useMemo, useState } from 'react';

// ─── Debt row ──────────────────────────────────────────────────────────────────

function DebtRow({ debt, onDelete }: { debt: Debt; onDelete: () => void }) {
  const progress =
    Number(debt.originalAmount) > 0
      ? Math.min((Number(debt.currentBalance) / Number(debt.originalAmount)) * 100, 100)
      : 0;

  const isOwedToMe = debt.direction === 'OWED_TO_ME';
  const isSettled = debt.status === 'SETTLED';
  const accentColor = isSettled ? '#93a19a' : isOwedToMe ? '#8bff62' : '#ff8a94';
  const pillBg = isSettled ? '#18221d' : isOwedToMe ? '#1a2c1f' : '#2b1719';
  const pillLabel = isSettled ? 'Settled' : isOwedToMe ? 'Owed to me' : 'I owe';

  return (
    <View className="gap-3 rounded-[20px] border border-[#17211c] bg-[#0f1512] p-4">
      {/* Top row */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-[15px] font-bold text-[#f4f7f5]" numberOfLines={1}>
              {debt.title}
            </Text>
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: pillBg }}>
              <Text className="text-[9px] font-bold uppercase tracking-[1.2px]" style={{ color: accentColor }}>
                {pillLabel}
              </Text>
            </View>
          </View>
          <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
            <Text className="text-[11px] text-[#4a5650]">{debt.counterpartyName}</Text>
            {debt.dueDate ? (
              <Text className="text-[11px] text-[#6d786f]">· Due {formatShortDate(debt.dueDate)}</Text>
            ) : null}
          </View>
        </View>
        <Pressable
          onPress={onDelete}
          className="size-8 items-center justify-center rounded-full bg-[#241719]"
          hitSlop={8}
        >
          <Trash2Icon color="#ff8a94" size={14} />
        </Pressable>
      </View>

      {/* Progress bar */}
      <View className="h-1.5 overflow-hidden rounded-full bg-[#1a2c1f]">
        <View
          className="h-full rounded-full"
          style={{ width: `${progress}%`, backgroundColor: accentColor }}
        />
      </View>

      {/* Bottom row */}
      <View className="flex-row items-center gap-1">
        <Text className="text-[12px] font-semibold" style={{ color: accentColor }}>
          {formatCurrency(debt.currentBalance, debt.currency)}
        </Text>
        <Text className="text-[12px] text-[#4a5650]">
          {' '}remaining of {formatCurrency(debt.originalAmount, debt.currency)}
        </Text>
      </View>

      {debt.notes ? (
        <Text className="text-[12px] leading-5 text-[#7f8c86]">{debt.notes}</Text>
      ) : null}
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function DebtsScreen() {
  const debtsQuery = useDebtsQuery();
  const deleteDebtMutation = useDeleteDebtMutation();
  const [activeTab, setActiveTab] = useState<DebtDirection>('I_OWE');

  const debts = debtsQuery.data ?? [];

  const iOweDebts = useMemo(
    () => debts.filter((d) => d.direction === 'I_OWE' && d.status !== 'SETTLED'),
    [debts]
  );
  const owedToMeDebts = useMemo(
    () => debts.filter((d) => d.direction === 'OWED_TO_ME' && d.status !== 'SETTLED'),
    [debts]
  );
  const settledDebts = useMemo(() => debts.filter((d) => d.status === 'SETTLED'), [debts]);

  const iOweTotalBalance = useMemo(
    () => iOweDebts.reduce((sum, d) => sum + Number(d.currentBalance), 0),
    [iOweDebts]
  );
  const owedToMeTotalBalance = useMemo(
    () => owedToMeDebts.reduce((sum, d) => sum + Number(d.currentBalance), 0),
    [owedToMeDebts]
  );

  const activeDebts = activeTab === 'I_OWE' ? iOweDebts : owedToMeDebts;
  const isEmpty = iOweDebts.length === 0 && owedToMeDebts.length === 0 && settledDebts.length === 0;

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Money between people"
            title="Debts"
            subtitle="Track what you owe and what should come back to you."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">

          {/* ── Summary chips (tab switcher) ── */}
          <View className="flex-row gap-2">
            {/* I owe chip */}
            <Pressable
              onPress={() => setActiveTab('I_OWE')}
              className="flex-row items-center gap-1.5 rounded-full border px-3 py-2"
              style={{
                borderColor: activeTab === 'I_OWE' ? '#ff8a9440' : '#17211c',
                backgroundColor: activeTab === 'I_OWE' ? '#2b1719' : '#111916',
              }}
            >
              <ArrowUpRightIcon color="#ff8a94" size={12} />
              <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#4a5650]">Owe</Text>
              <Text className="text-[13px] font-bold text-[#ff8a94]">
                {formatCurrency(iOweTotalBalance)}
              </Text>
            </Pressable>

            {/* Owed to me chip */}
            <Pressable
              onPress={() => setActiveTab('OWED_TO_ME')}
              className="flex-row items-center gap-1.5 rounded-full border px-3 py-2"
              style={{
                borderColor: activeTab === 'OWED_TO_ME' ? '#8bff6230' : '#17211c',
                backgroundColor: activeTab === 'OWED_TO_ME' ? '#16211b' : '#111916',
              }}
            >
              <ArrowDownLeftIcon color="#8bff62" size={12} />
              <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#4a5650]">Receive</Text>
              <Text className="text-[13px] font-bold text-[#8bff62]">
                {formatCurrency(owedToMeTotalBalance)}
              </Text>
            </Pressable>
          </View>

          {/* ── Add button (standard green pill, own line) ── */}
          <Pressable
            className="h-12 self-start flex-row items-center justify-center gap-2 rounded-full bg-[#8bff62] px-5"
            onPress={() => router.push(`/debt-compose?direction=${activeTab}` as any)}
          >
            <PlusIcon color="#07110a" size={16} />
            <Text className="text-sm font-semibold text-[#07110a]">
              {activeTab === 'I_OWE' ? 'Add debt' : 'Add receivable'}
            </Text>
          </Pressable>

          {/* ── Empty state ── */}
          {isEmpty ? (
            <View className="items-center rounded-[24px] border border-[#17211c] bg-[#0f1512] px-5 py-8">
              <View className="size-12 items-center justify-center rounded-full bg-[#1f2217]">
                <HandCoinsIcon color="#d9f27c" size={20} />
              </View>
              <Text className="mt-3 text-center text-[16px] font-bold text-[#f4f7f5]">
                No debts yet
              </Text>
              <Text className="mt-1.5 text-center text-[13px] leading-5 text-[#7f8c86]">
                Add your first debt so Penni can track what is still outstanding.
              </Text>
            </View>
          ) : null}

          {/* ── Active tab list ── */}
          {activeDebts.length > 0 ? (
            <View className="gap-2.5">
              <View className="flex-row items-center justify-between px-0.5">
                <Text className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">
                  {activeTab === 'I_OWE' ? 'Outstanding' : 'Incoming'}
                </Text>
                <View
                  className="rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: activeTab === 'I_OWE' ? '#2b1719' : '#16211b' }}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ color: activeTab === 'I_OWE' ? '#ff8a94' : '#8bff62' }}
                  >
                    {activeDebts.length} open
                  </Text>
                </View>
              </View>
              {activeDebts.map((debt) => (
                <DebtRow
                  key={debt.id}
                  debt={debt}
                  onDelete={() => deleteDebtMutation.mutate(debt.id)}
                />
              ))}
            </View>
          ) : debts.length > 0 ? (
            <View className="items-center rounded-[24px] border border-[#17211c] bg-[#0f1512] px-5 py-6">
              <Text className="text-[15px] font-bold text-[#f4f7f5]">
                {activeTab === 'I_OWE' ? 'No outstanding debt' : 'No incoming debt'}
              </Text>
              <Text className="mt-1.5 text-center text-[13px] leading-5 text-[#7f8c86]">
                {activeTab === 'I_OWE'
                  ? 'Nothing marked as money you still owe.'
                  : 'Nothing marked as money owed back to you.'}
              </Text>
            </View>
          ) : null}

          {/* ── Settled list ── */}
          {settledDebts.length > 0 ? (
            <View className="gap-2.5">
              <View className="flex-row items-center justify-between px-0.5">
                <Text className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">
                  Settled
                </Text>
                <View className="rounded-full bg-[#18221d] px-2.5 py-0.5">
                  <Text className="text-[10px] font-bold text-[#93a19a]">
                    {settledDebts.length} archived
                  </Text>
                </View>
              </View>
              {settledDebts.map((debt) => (
                <DebtRow
                  key={debt.id}
                  debt={debt}
                  onDelete={() => deleteDebtMutation.mutate(debt.id)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <AppTabBar currentTab="profile" />
    </View>
  );
}
