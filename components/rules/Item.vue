<script setup lang="ts">
import type { RuleID, RuleItem } from '~/components/rules/types'
import { getRuleCategory } from '~/components/rules/getRules'

const props = defineProps<{
  activeItemId: string | 0
  rule: RuleItem
  id: RuleID
  slider: any
}>()
const emit = defineEmits(['onClick'])
const ruleCategory = computed(() =>
  getRuleCategory($store.state.categories.items, props.rule.categoryId))

const { $store } = useNuxtApp()

const onClickItem = () => emit('onClick', props.id)
</script>

<template lang="pug">
.cursor-pointer.py-2.px-2.gap-x-3.flex.items-center.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
  v-if="rule"
  :class="{ '!cursor-default !bg-skin-item-main-active': activeItemId === id }"
  @click="onClickItem"
)
  .w-8.h-8.flex.items-center.justify-center.rounded-full.text-xl.leading-none.text-neutral-50(
      :style="{ background: ruleCategory.color }"
    ): div(:class="ruleCategory.icon")

  .grow.truncate
    .leading-none.text-sm.text-skin-item-base {{ rule.name }}
</template>
