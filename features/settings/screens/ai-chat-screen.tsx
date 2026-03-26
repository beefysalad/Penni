import { AppPageHeader } from '@/components/navigation/app-page-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  buildExecutableCommand,
  parseCommandAssistant,
  type ExecutableCommand,
} from '@/features/ai/lib/command-assistant';
import {
  getAppleIntelligenceAvailability,
  supportsAppleIntelligenceSummary,
} from '@/features/ai/lib/apple-intelligence';
import {
  useAccountsQuery,
  useCreateAccountMutation,
} from '@/features/finance/hooks/use-accounts-query';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { useCreatePlannedItemMutation } from '@/features/finance/hooks/use-planned-items-query';
import { useCreateTransactionMutation } from '@/features/finance/hooks/use-transactions-query';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BotIcon, SendIcon, SparklesIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

// ─── Constants ─────────────────────────────────────────────────────────────────
export default function AIChatScreen() {
  const accountsQuery = useAccountsQuery();
  const categoriesQuery = useCategoriesQuery();
  const createAccountMutation = useCreateAccountMutation();
  const createTransactionMutation = useCreateTransactionMutation();
  const createPlannedItemMutation = useCreatePlannedItemMutation();

  const accounts = accountsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const [command, setCommand] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('Checking Apple Intelligence availability…');
  const [isAppleAIAvailable, setIsAppleAIAvailable] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<ExecutableCommand | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAvailability() {
      if (!supportsAppleIntelligenceSummary()) {
        if (!isMounted) return;
        setIsAppleAIAvailable(false);
        setAvailabilityMessage('Apple Intelligence command parsing is only available on iOS.');
        return;
      }

      try {
        const availability = await getAppleIntelligenceAvailability();
        if (!isMounted) return;
        setIsAppleAIAvailable(availability.isAvailable);
        setAvailabilityMessage(availability.message);
      } catch {
        if (!isMounted) return;
        setIsAppleAIAvailable(false);
        setAvailabilityMessage('Unable to determine Apple Intelligence availability.');
      }
    }

    loadAvailability();

    return () => {
      isMounted = false;
    };
  }, []);

  const isExecuting =
    createAccountMutation.isPending ||
    createTransactionMutation.isPending ||
    createPlannedItemMutation.isPending;

  async function handleParse() {
    if (!command.trim()) {
      setParseError('Type a command first.');
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setExecutionMessage(null);
    setPreview(null);

    try {
      const parsed = await parseCommandAssistant({
        command,
        accounts,
        categories,
      });
      const executable = buildExecutableCommand(parsed, {
        accounts,
        categories,
      });
      setPreview(executable);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Penni could not parse that command yet.');
    } finally {
      setIsParsing(false);
    }
  }

  async function handleConfirm() {
    if (!preview) return;

    try {
      if (preview.kind === 'create_account') {
        await createAccountMutation.mutateAsync(preview.payload);
        setExecutionMessage(`Account created: ${preview.payload.name}`);
      } else if (preview.kind === 'create_transaction') {
        await createTransactionMutation.mutateAsync(preview.payload);
        setExecutionMessage(`${preview.payload.type === 'EXPENSE' ? 'Expense' : 'Income'} saved.`);
      } else {
        await createPlannedItemMutation.mutateAsync(preview.payload);
        setExecutionMessage('Recurring item created.');
      }

      setPreview(null);
      setCommand('');
      setParseError(null);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Penni could not complete that action.');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-12"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
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
            eyebrow="Penni AI"
            title="AI chat"
            subtitle="Command assistant v1: one turn, one parse, one confirmation, then save."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="rounded-[30px] border border-[#203326] bg-[#0d1511] p-6 shadow-xl shadow-[#8bff62]/5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View className="size-10 items-center justify-center rounded-[14px] border border-[#203326] bg-[#16231b]">
                  <Icon as={SparklesIcon} className="size-4 text-[#8bff62]" />
                </View>
                <Text className="text-[20px] font-semibold tracking-[-0.5px] text-[#f4f7f5]">
                  Penni AI Chat
                </Text>
              </View>
              {isAppleAIAvailable ? (
                <View className="flex-row items-center gap-1.5 rounded-full border border-[#1a2c1f] bg-[#111c16] px-2.5 py-1">
                  <View className="size-1.5 rounded-full bg-[#8bff62] opacity-80" />
                  <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#8bff62]">
                    Active
                  </Text>
                </View>
              ) : null}
            </View>

            <Text className="mb-5 text-[14px] leading-5 text-[#95a39c]">
              {isAppleAIAvailable
                ? 'Type what you want to do. Penni will understand and prepare the action for you.'
                : availabilityMessage}
            </Text>

            <View className="rounded-[24px] border border-[#17241b] bg-[#111916] p-5 shadow-sm shadow-black/20">
              <TextInput
                value={command}
                onChangeText={setCommand}
                placeholder="e.g., Add 500 expense using GCash for lunch..."
                placeholderTextColor="#5c6a62"
                multiline
                textAlignVertical="top"
                className="min-h-[100px] text-[16px] leading-7 text-[#eef3ef]"
                style={{ includeFontPadding: false }}
              />

              <View className="mt-2 flex-row items-end justify-between">
                <Text className="flex-1 text-[11px] uppercase tracking-[1px] text-[#344238]">
                  {command.trim() ? `${command.length} characters` : 'Ready'}
                </Text>
                <Button
                  className="h-10 rounded-full bg-[#8bff62] px-4"
                  variant="ghost"
                  size="sm"
                  disabled={!isAppleAIAvailable || isParsing || isExecuting || !command.trim()}
                  onPress={handleParse}>
                  <Text className="text-sm font-bold text-[#07110a]">
                    {isParsing ? 'Thinking...' : 'Send'}
                  </Text>
                  <Icon as={SendIcon} className="ml-2 size-4 text-[#07110a]" />
                </Button>
              </View>
            </View>
          </View>

          {preview ? (
            <View className="rounded-[30px] border border-[#203326] bg-[#0d1511] p-6 shadow-xl shadow-[#ffc857]/5">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="size-10 items-center justify-center rounded-[14px] border border-[#2b2715] bg-[#1c1911]">
                    <Icon as={BotIcon} className="size-4 text-[#ffc857]" />
                  </View>
                  <Text className="text-[20px] font-semibold tracking-[-0.5px] text-[#f4f7f5]">
                    Action Preview
                  </Text>
                </View>
              </View>

              <Text className="mb-5 text-[14px] leading-5 text-[#95a39c]">
                Review what Penni is about to do. Only confirm if it matches your request.
              </Text>

              <View className="rounded-[24px] border border-[#1c1911] bg-[#111916] p-5 shadow-sm shadow-black/20">
                <Text className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-[#ffc857]">
                  {preview.previewTitle}
                </Text>

                <View className="gap-2">
                  {preview.previewLines.map((line, i) => (
                    <Text key={i} className="text-[15px] leading-6 text-[#eef3ef]">
                      {line}
                    </Text>
                  ))}
                </View>
              </View>

              <View className="mt-5 flex-row gap-3">
                <Button
                  className="h-12 flex-1 rounded-full bg-[#8bff62]"
                  variant="ghost"
                  size="sm"
                  disabled={isExecuting}
                  onPress={handleConfirm}>
                  <Text className="text-[15px] font-bold text-[#07110a]">
                    {isExecuting ? 'Saving...' : 'Confirm'}
                  </Text>
                </Button>
                <Button
                  className="h-12 flex-1 rounded-full border border-[#203326] bg-[#111916]"
                  variant="ghost"
                  size="sm"
                  disabled={isExecuting}
                  onPress={() => setPreview(null)}>
                  <Text className="text-[15px] font-bold text-[#f4f7f5]">Discard</Text>
                </Button>
              </View>
            </View>
          ) : null}

          {parseError ? (
            <View className="rounded-[24px] border border-[#3a1f24] bg-[#1b1114] px-4 py-3.5">
              <Text className="text-[14px] leading-6 text-[#ff8a94]">
                <Text className="font-bold">Error: </Text>
                {parseError}
              </Text>
            </View>
          ) : null}

          {executionMessage ? (
            <View className="rounded-[24px] border border-[#203326] bg-[#101913] px-4 py-3.5 flex-row items-center gap-3">
              <View className="size-2 rounded-full bg-[#8bff62]" />
              <Text className="text-[14px] leading-6 text-[#8bff62] flex-1">{executionMessage}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
