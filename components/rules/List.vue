<script setup lang="ts">
import type { RuleID } from '~/components/rules/types'

defineProps<{
  ids: RuleID[]
  activeItemId?: string | 0
  slider?: object
}>()
</script>

<template lang="pug">
.grid.gap-y-1.gap-x-1.3sm_grid-cols-2.sm_gap-x-6
  RulesItem(
    v-for="ruleId in ids"
    :activeItemId="activeItemId"
    :rule="$store.state.rules.items[ruleId]"
    :id="ruleId"
    :key="ruleId"
    :slider="slider"
    v-on="$listeners"
  )
</template>
