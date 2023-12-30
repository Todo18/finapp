<script setup lang="ts">
const { $store, nuxt2Context: { i18n } } = useNuxtApp()
const rulesRootIds = computed(() => $store.getters['rules/rulesRootIds'])

// Clear any leftovers
$store.commit('rules/setNewRuleFromTrn')

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

  //- List
  .pt-1.pb-12.px-2
    RulesList(
      :ids="rulesRootIds"
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
