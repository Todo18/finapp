<script setup lang="ts">
import type { RuleID, RuleItem } from '~/components/rules/types'
import { getPreparedFormData } from '~/components/rules/getForm'
import { getRuleCategory } from '~/components/rules/getRules'

const { $store, nuxt2Context: { i18n } } = useNuxtApp()
const router = useRouter()
const route = useRoute()

const ruleId = computed<RuleID>(() => route.params.id)
const rule = computed<RuleItem>(() => $store.state.rules.items[ruleId.value])
const ruleForm = ref(getPreparedFormData(rule.value))
const ruleCategory = computed(() =>
  getRuleCategory($store.state.categories.items, ruleForm.value.categoryId))

const updateValue = (id, value) => ruleForm.value[id] = value
const afterSave = () => router.replace(`/rules/${ruleId.value}`)

useHead({
  title: `${i18n.t('base.edit')}: ${ruleForm.value?.name ? ruleForm.value?.name : i18n.t('rules.form.name.label')}`,
})
</script>

<template lang="pug">
UiPage(v-if="rule")
  UiHeader
    router-link(
      v-slot="{ href, navigate }"
      to="/rules"
      custom
    )
      a.grow.hocus_bg-item-main-hover(
        :href='href'
        @click='navigate'
      )
        UiHeaderTitle
          .pt-1.text-xs.font-medium.text-item-base-down
            | {{ $t('rules.title') }}

          .pb-1.flex.items-center.gap-4
            | {{ ruleForm.name }}
            .w-8.h-8.rounded-full.flex-center.text-xl.text-icon-base

    template(#actions)
      RulesDelete(:ruleId="ruleId")

  .mt-3
    RulesForm(
      :ruleId="ruleId"
      :ruleForm="ruleForm"
      @updateValue="updateValue"
      @afterSave="afterSave"
    )
</template>
