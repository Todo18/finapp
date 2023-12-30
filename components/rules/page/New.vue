<script setup lang="ts">
import { RuleItem } from '~/components/rules/types'
import { getPreparedFormData } from '~/components/rules/getForm'
import { getRuleCategory } from '~/components/rules/getRules'

const { $store } = useNuxtApp()
const router = useRouter()

const rule = computed<RuleItem>(() => $store.state.rules.newFromTrn)
const ruleForm = ref(getPreparedFormData(rule.value))
const ruleCategory = computed(() =>
  getRuleCategory($store.state.categories.items, ruleForm.value.categoryId))

const updateValue = (id, value) => ruleForm.value[id] = value
const afterSave = () => router.replace('/rules/')
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: `${this.$t('base.add')}: ${this.ruleForm.name ? this.ruleForm.name : this.$t('rules.form.name.label')}`,
    }
  },
})
</script>

<template lang="pug">
UiPage
  UiHeader
    router-link(
      v-slot="{ href, navigate }"
      to="/rules"
      custom
    )
      a.grow.hocus_bg-item-main-hover(
        :href="href"
        @click="navigate"
      )
        UiHeaderTitle
          .pt-1.text-xs.font-medium.text-item-base-down
            | {{ $t('rules.createNewTitle') }}

          .pb-1.flex.items-center.gap-4
            | {{ ruleForm.name ? ruleForm.name : $t("rules.form.name.label") }}
            .w-8.h-8.rounded-full.flex-center.text-xl.text-icon-base

  RulesForm(
    :ruleForm="ruleForm"
    @updateValue="updateValue"
    @afterSave="afterSave"
  )
</template>
