<script setup lang="ts">
const { $store } = useNuxtApp()
const rulesRootIds = computed(() => $store.getters['rules/rulesRootIds'])

// Clear any leftovers
$store.commit('rules/setNewRuleFromTrn')
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: this.$t('rules.title'),
    }
  },
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
      .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
        class="basis-1/2 max-w-[280px]"
        @click="$router.push('/rules/new')"
      ) {{ $t('rules.new') }}
</template>
