import { Field } from '@/components/forms/field';
import { CENTERED_INPUT_STYLE } from '@/components/forms/input-styles';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateFeedbackMutation } from '@/features/settings/hooks/use-feedback-mutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  AngryIcon,
  BugIcon,
  FrownIcon,
  HeartIcon,
  LightbulbIcon,
  MehIcon,
  MessageSquareIcon,
  PartyPopperIcon,
  SmileIcon,
} from 'lucide-react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { z } from 'zod';

const FEEDBACK_TYPES = [
  {
    value: 'bug',
    label: 'Bug report',
    description: 'Something is broken or not working as expected.',
    icon: BugIcon,
    iconBg: 'bg-[#241719]',
    iconColor: '#ff8a94',
  },
  {
    value: 'feature',
    label: 'Feature request',
    description: "Suggest something you'd love to see.",
    icon: LightbulbIcon,
    iconBg: 'bg-[#2a2518]',
    iconColor: '#ffc857',
  },
  {
    value: 'general',
    label: 'General feedback',
    description: 'Share praise, friction, or anything on your mind.',
    icon: MessageSquareIcon,
    iconBg: 'bg-[#1e1c2e]',
    iconColor: '#a084ff',
  },
  {
    value: 'love',
    label: 'Show some love',
    description: 'Tell us what Penni gets right.',
    icon: HeartIcon,
    iconBg: 'bg-[#1f1520]',
    iconColor: '#e879a0',
  },
] as const;

const MOODS = [
  { value: 1, label: 'Frustrated', icon: AngryIcon, color: '#ff8a94' },
  { value: 2, label: 'Unhappy', icon: FrownIcon, color: '#ffc857' },
  { value: 3, label: 'Neutral', icon: MehIcon, color: '#93a19a' },
  { value: 4, label: 'Happy', icon: SmileIcon, color: '#41d6b2' },
  { value: 5, label: 'Loving it', icon: PartyPopperIcon, color: '#8bff62' },
] as const;

const QUICK_TAGS = [
  'UI / Design',
  'Performance',
  'Budgets',
  'Recurring items',
  'Activity log',
  'Accounts',
  'Categories',
  'Notifications',
  'Mobile experience',
  'Data accuracy',
] as const;

const feedbackSchema = z.object({
  feedbackType: z.enum(['bug', 'feature', 'general', 'love']),
  mood: z.number().int().min(1).max(5),
  selectedTags: z.array(z.string()),
  message: z
    .string()
    .trim()
    .min(1, 'Please add a message before sending feedback.')
    .max(1000, 'Feedback message is too long.'),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      'Please enter a valid email address.',
    ),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const feedbackTypeMap = {
  bug: 'BUG_REPORT',
  feature: 'FEATURE_REQUEST',
  general: 'GENERAL_FEEDBACK',
  love: 'SHOW_SOME_LOVE',
} as const;

const moodMap = {
  1: 'FRUSTRATED',
  2: 'UNHAPPY',
  3: 'NEUTRAL',
  4: 'HAPPY',
  5: 'LOVING_IT',
} as const;

export default function FeedbackScreen() {
  const createFeedbackMutation = useCreateFeedbackMutation();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedbackType: 'general',
      mood: 3,
      selectedTags: [],
      message: '',
      email: '',
    },
  });

  const feedbackType = useWatch({ control, name: 'feedbackType' });
  const mood = useWatch({ control, name: 'mood' });
  const selectedTags = useWatch({ control, name: 'selectedTags' }) ?? [];
  const message = useWatch({ control, name: 'message' }) ?? '';
  const selectedType = FEEDBACK_TYPES.find((item) => item.value === feedbackType) ?? FEEDBACK_TYPES[2];

  const onSubmit = handleSubmit(async (values) => {
    const finalMessage =
      values.selectedTags.length > 0
        ? `${values.message.trim()}\n\nTags: ${values.selectedTags.join(', ')}`
        : values.message.trim();

    await createFeedbackMutation.mutateAsync({
      feedbackType: feedbackTypeMap[values.feedbackType],
      mood: moodMap[values.mood as keyof typeof moodMap],
      message: finalMessage,
      ...(values.email.trim() ? { email: values.email.trim() } : {}),
    });

    router.back();
  });

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-safe pt-4">
        <Button
          variant="ghost"
          className="h-11 self-start rounded-full bg-[#111916] px-4"
          onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-[#f4f7f5]">Back</Text>
        </Button>

        <View className="mt-6 rounded-[32px] border border-[#1b2a21] bg-[#0d1411] p-6">
          <Text className="text-[11px] font-semibold uppercase tracking-[2.4px] text-[#8bff62]">
            Support
          </Text>
          <Text className="mt-4 text-[30px] font-semibold text-white">Send feedback</Text>
          <Text className="mt-2 text-[15px] leading-6 text-[#95a39c]">
            Help improve Penni. Every note goes straight into the product queue.
          </Text>
        </View>

        <View className="mt-6 gap-5">
          <View className="rounded-[24px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
              Feedback type
            </Text>
            <View className="mt-4 gap-3">
              {FEEDBACK_TYPES.map((item) => {
                const Icon = item.icon;
                const isActive = item.value === feedbackType;

                return (
                  <Pressable
                    key={item.value}
                    className={`rounded-[20px] border p-4 ${
                      isActive ? 'border-[#52d776] bg-[#111c16]' : 'border-[#17211c] bg-[#131b17]'
                    }`}
                    onPress={() =>
                      setValue('feedbackType', item.value, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }>
                    <View className="flex-row items-start gap-3">
                      <View className={`size-10 items-center justify-center rounded-[14px] ${item.iconBg}`}>
                        <Icon color={item.iconColor} size={18} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[15px] font-semibold text-[#f4f7f5]">{item.label}</Text>
                        <Text className="mt-1 text-xs leading-5 text-[#6d786f]">{item.description}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="rounded-[24px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
              Overall feeling
            </Text>
            <View className="mt-4 flex-row gap-2">
              {MOODS.map((entry) => {
                const Icon = entry.icon;
                const isActive = entry.value === mood;

                return (
                  <Pressable
                    key={entry.value}
                    className={`flex-1 items-center rounded-[18px] border py-4 ${
                      isActive ? 'border-[#52d776] bg-[#111c16]' : 'border-[#17211c] bg-[#131b17]'
                    }`}
                    onPress={() =>
                      setValue('mood', entry.value, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }>
                    <Icon color={isActive ? entry.color : '#4a5650'} size={22} />
                  </Pressable>
                );
              })}
            </View>
            <Text className="mt-3 text-center text-[12px] font-semibold uppercase tracking-[1.4px] text-[#95a39c]">
              {MOODS.find((entry) => entry.value === mood)?.label}
            </Text>
            {errors.mood?.message ? (
              <Text className="mt-2 text-sm text-[#ff8a94]">{errors.mood.message}</Text>
            ) : null}
          </View>

          <View className="rounded-[24px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
              Topic tags
            </Text>
            <Text className="mt-2 text-sm leading-6 text-[#7f8c86]">
              Optional. Pick all that apply.
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    className={`rounded-full border px-4 py-2 ${
                      isActive ? 'border-[#8bff62]/40 bg-[#8bff62]/10' : 'border-[#17211c] bg-[#131b17]'
                    }`}
                    onPress={() => {
                      const nextTags = isActive
                        ? selectedTags.filter((value) => value !== tag)
                        : [...selectedTags, tag];
                      setValue('selectedTags', nextTags, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }}>
                    <Text className={`text-[13px] font-semibold ${isActive ? 'text-[#8bff62]' : 'text-[#7f8c86]'}`}>
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="rounded-[24px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
                  Your message
                </Text>
                <Text className="mt-2 text-[20px] font-semibold text-[#f4f7f5]">
                  Tell me more
                </Text>
              </View>
              <View className={`size-12 items-center justify-center rounded-full ${selectedType.iconBg}`}>
                <selectedType.icon color={selectedType.iconColor} size={20} />
              </View>
            </View>

            <View className="mt-5 gap-4">
              <Field label="Message" error={errors.message?.message}>
                <View className="rounded-[20px] bg-[#141d18] px-4 py-3 shadow-sm shadow-black/20">
                  <Controller
                    control={control}
                    name="message"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        multiline
                        numberOfLines={6}
                        placeholder={
                          feedbackType === 'bug'
                            ? 'Describe what happened and how to reproduce it.'
                            : feedbackType === 'feature'
                              ? 'What would you like to see, and why would it help?'
                              : feedbackType === 'love'
                                ? 'What do you enjoy most about Penni?'
                                : 'Share anything on your mind.'
                        }
                        placeholderTextColor="#6f7d74"
                        autoCorrect
                        spellCheck
                        textAlignVertical="top"
                        className="min-h-[132px] bg-transparent px-0 text-[16px] leading-6 text-[#f4f7f5]"
                        style={CENTERED_INPUT_STYLE}
                      />
                    )}
                  />
                </View>
              </Field>

              <Text className="text-right text-xs font-medium text-[#6d786f]">
                {message.length} / 1000
              </Text>

              <Field label="Reply-to email (optional)" error={errors.email?.message}>
                <View className="rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        autoComplete="email"
                        placeholder="you@example.com"
                        placeholderTextColor="#6f7d74"
                        className="h-12 bg-transparent px-0 text-[16px] text-[#f4f7f5]"
                        style={CENTERED_INPUT_STYLE}
                      />
                    )}
                  />
                </View>
              </Field>
            </View>
          </View>

          {createFeedbackMutation.isError ? (
            <Text className="text-sm text-[#ff8a94]">
              {createFeedbackMutation.error instanceof Error
                ? createFeedbackMutation.error.message
                : 'Failed to send feedback.'}
            </Text>
          ) : null}

          <Button
            className="h-14 rounded-[22px] bg-[#8bff62]"
            onPress={onSubmit}
            disabled={createFeedbackMutation.isPending}>
            <Text className="text-base font-semibold text-[#07110a]">
              {createFeedbackMutation.isPending ? 'Sending feedback...' : 'Send feedback'}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
