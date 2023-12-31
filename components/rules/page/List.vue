<script setup lang="ts">
import type { ComputedRef } from 'vue'
import type { RuleID, RuleItem } from '~/components/rules/types'

const { $store, nuxt2Context: { i18n } } = useNuxtApp()
const rules = $store.state.rules.items
const rulesRootIds: ComputedRef<RuleID[]> = computed(() => $store.getters['rules/rulesRootIds'])

// Clear any leftovers
$store.commit('rules/setNewRuleFromTrn')

const searchInput = ref('')
const list = computed(() => {
  if (searchInput.value) {
    const needle = searchInput.value.toLowerCase()
    return rulesRootIds.value.filter((ruleId: RuleID) => {
        const rule: RuleItem = rules[ruleId]
        return rule.name.toLowerCase().includes(needle) || rule.condition.toLowerCase().includes(needle)
    })
  }

  return rulesRootIds.value
})

useHead({
  title: i18n.t('rules.title'),
})
</script>

<template lang="pug">
UiPage
  UiHeader
    UiHeaderTitle {{ $t('rules.name') }}
    template(#actions)
      UiHeaderLink(@click="$router.push('/rules/new')")
        UiIconAdd.w-5.h-5.group-hover_text-white

  .px-2
    input.w-full.m-0.py-2.px-3.rounded-lg.text-base.font-normal.text-item-base.bg-item-main-bg.border.border-solid.border-item-main-hover.placeholder_text-item-base-down.transition.ease-in-out.focus_text-item-base-up.focus_bg-item-main-hover.focus_border-blue3.focus_outline-none(
      placeholder="Search..."
      v-model="searchInput"
      type="text"
    )

  //- List
  .pt-1.pb-12.px-2
    RulesList(
      :ids="list"
      @onClick="ruleId => $router.push(`/rules/${ruleId}`)"
    )

  template(#bottom)
    .pb-4.px-2.flex.justify-evenly.gap-6
      //- Create
      .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-item-main-bg.hocus_bg-item-main-hover(
        class="basis-1/2 max-w-[280px]"
        @click="$router.push('/rules/new')"
      ) {{ $t('rules.new') }}
</template>
