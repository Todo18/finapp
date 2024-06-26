<script setup lang="ts">
import type { TrnId, TrnItem, TrnType } from '~/components/trns/types'
import useTrns from '~/components/trns/useTrns'
import useStatPage from '~/components/stat/useStatPage'

const props = withDefaults(defineProps<{
  trnsIds: TrnId[]
  trnsClassNames?: string
  defaultFilterTrnsPeriod?: string
  isFilterByDay?: boolean
}>(), {
  trnsClassNames: 'grid md_grid-cols-2 md_gap-x-20',
})
const emit = defineEmits(['onClickEdit'])

const { $store } = useNuxtApp()
const filterTrnsType = ref<TrnType | null>(null)
const filterTrnsPeriod = ref(props.defaultFilterTrnsPeriod)
const { allTrnsIdsWithFilter } = useTrns()
const { statPage } = useStatPage()

// Return to filter 'period', when global filter params changed
watch(statPage.filter, () => filterTrnsPeriod.value = 'period')

const filteredTrnsIds = computed(() => {
  const trnsIds = props.defaultFilterTrnsPeriod && filterTrnsPeriod.value === 'all'
    ? allTrnsIdsWithFilter.value
    : props.trnsIds

  if (filterTrnsType.value === null)
    return trnsIds

  const trnsItems: Record<TrnId, TrnItem> = $store.state.trns.items
  return trnsIds.filter(id => trnsItems[id].type === filterTrnsType.value)
})

const trnsCount = computed(() => filteredTrnsIds.value?.length ?? 0)

function setFilterTrnsType(type: TrnType) {
  filterTrnsType.value = type
}

function onClickEdit(props) {
  emit('onClickEdit', props)
}
</script>

<template lang="pug">
.grid.h-full.overflow-hidden.px-2(
  class="grid-rows-[auto,1fr]"
)
  //- Header
  div
    .pb-2.flex.items-center.justify-between.gap-2(
      v-if="trnsCount > 0 || defaultFilterTrnsPeriod"
      class="!pb-3"
    )
      //- Title
      UiTitle.px-1
        .flex.gap-2
          div {{ $t('trns.inPeriodTitle') }}:
          div {{ trnsCount }}

      .div(v-if="defaultFilterTrnsPeriod")
        UiTabs
          UiTabsItem(
            :isActive="filterTrnsPeriod === 'period'"
            @click="filterTrnsPeriod = 'period'"
          ) {{ $t('dates.period') }}
          UiTabsItem(
            :isActive="filterTrnsPeriod === 'all'"
            @click="filterTrnsPeriod = 'all'"
          ) {{ $t('common.all') }}

    //- TypeSelector
    .pb-2(v-if="trnsCount > 0")
      UiTabs
        UiTabsItem(
          :isActive="filterTrnsType === null"
          @click="setFilterTrnsType(null)"
        ) {{ $t('common.all') }}

        UiTabsItem(
          :isActive="filterTrnsType === 0"
          @click="setFilterTrnsType(0)"
        ) {{ $t('money.expense') }}

        UiTabsItem(
          :isActive="filterTrnsType === 1"
          @click="setFilterTrnsType(1)"
        ) {{ $t('money.income') }}

        UiTabsItem(
          :isActive="filterTrnsType === 2"
          @click="setFilterTrnsType(2)"
        ) {{ $t('transfer.titleMoney') }}

  .h-full.scroll.scrollerBlock.h-full.overflow-y-auto
    //- Nothing
    .h-full.flex-center.pb-2(v-if="trnsCount === 0")
      .py-3.text-center
        .text-7xl.mdi.mdi-palm-tree
        .text-md {{ $t('trns.noTrns') }}

    //- List
    .h-full.pb-10(v-else)
      div(:class="trnsClassNames")
        TrnsList(
          :trnsIds="filteredTrnsIds"
          :size="50"
          :isFilterByDay="isFilterByDay"
          isShowFilter
          uiHistory
          @onClickEdit="onClickEdit"
        )
</template>
