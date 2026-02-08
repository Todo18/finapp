<script setup lang="ts">
import dayjs from 'dayjs'
import type { TrnId } from '~/components/trns/types'
import useFilter from '~/components/filter/useFilter'
import { useTrnForm } from '~/components/trnForm/useTrnForm'

const props = withDefaults(defineProps<{
  limit: number
  size: number
  trnsIds: TrnId[]

  isShowFilter?: boolean
  isFilterByDay?: boolean
  isShowGroupDate?: boolean
  uiCat?: boolean
  uiHistory?: boolean
}>(), {
  isShowFilter: false,
  isShowGroupDate: true,
  limit: 0,
  size: 30,
  uiHistory: false,
})
const emit = defineEmits(['onClickEdit'])

const { $store } = useNuxtApp()
const { setFilterCatsId, setDayDate } = useFilter()
const { trnFormEdit } = useTrnForm()

const pageNumber = ref(1)
const isShowTrnsWithDesc = ref(false)
const descriptionFilter = ref('')

const descriptionFilterWords = computed(() =>
  descriptionFilter.value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean))

function getTrnDescription(id: TrnId) {
  const trnItem = $store.state.trns.items[id]
  return String(trnItem.desc || trnItem.description || '').toLowerCase()
}

const isTrnsWithDescription = computed(() =>
  props.trnsIds.some(id => getTrnDescription(id)))

const trnsIdsWithLimit = computed(() => {
  if (props.isShowFilter && isShowTrnsWithDesc.value && isTrnsWithDescription.value) {
    return props.trnsIds.filter((id) => {
      const description = getTrnDescription(id)

      if (!description)
        return false

      if (!descriptionFilterWords.value.length)
        return true

      return descriptionFilterWords.value.every(word => description.includes(word))
    })
  }

  if (props.limit > 0)
    return props.trnsIds.slice(0, props.limit)

  return props.trnsIds
})

const paginatedTrnsIds = computed(() =>
  trnsIdsWithLimit.value.slice(0, pageNumber.value * props.size))

const isShowedAllTrns = computed(() =>
  paginatedTrnsIds.value.length === trnsIdsWithLimit.value.length)

// TODO: duplicate function
const groupedTrns = computed(() => {
  const trnsItems = $store.state.trns.items
  const trnsIds = paginatedTrnsIds.value

  return trnsIds.reduce((acc, trnId) => {
    const date = dayjs(trnsItems[trnId].date).startOf('day').valueOf()
    acc[date] ??= []
    acc[date].push(trnId)
    return acc
  }, {})
})

function showMoreTrns() {
  pageNumber.value += 1
}

function toggleTrnsWithDesc() {
  isShowTrnsWithDesc.value = !isShowTrnsWithDesc.value

  if (!isShowTrnsWithDesc.value)
    descriptionFilter.value = ''
}

function actions(trnItem) {
  return {
    onOpenDetails: () => {
      if (!$store.state.trns.modal.show) {
        $store.commit('trns/showTrnModal')
        $store.commit('trns/setTrnModalId', trnItem.id)
      }
    },

    onOpenEdit: (event) => {
      event.stopPropagation()
      trnFormEdit(trnItem.id)
    },

    // TODO: useFilter
    onSetFilter: (event) => {
      event.stopPropagation()
      setFilterCatsId(trnItem.categoryId)
      $store.commit('filter/setFilterDateNow')
      $store.commit('trns/hideTrnModal')
      $store.commit('trns/setTrnModalId', null)
      $store.dispatch('ui/setActiveTabStat', 'details')
    },
  }
}
</script>

<template lang="pug">
div(v-if="trnsIds && trnsIds.length > 0")
  .pb-2(v-if="isShowFilter && isTrnsWithDescription")
    SharedContextMenuItem(
      :checkboxValue="isShowTrnsWithDesc"
      :grow="false"
      :title="$t('trns.filter.showTrnsWithDesc')"
      icon="mdi mdi-comment-text-outline"
      showCheckbox
      @onClick="toggleTrnsWithDesc"
    )
    input.mt-2.w-full.m-0.py-2.px-3.rounded-lg.text-base.font-normal.text-item-base.bg-item-main-bg.border.border-solid.border-item-main-hover.placeholder_text-item-base-down.transition.ease-in-out.focus_text-item-base-up.focus_bg-item-main-hover.focus_border-blue3.focus_outline-none(
      v-if="isShowTrnsWithDesc"
      v-model="descriptionFilter"
      :placeholder="$t('trns.filter.descriptionSearchPlaceholder')"
      type="text"
    )

  .grid(
    :class="{ 'gap-2': uiHistory }"
  )
    .overflow-hidden.bg-item-main-bg.rounded-md(
      v-for="(trnsIds, date) in groupedTrns"
      :key="date"
    )
      .pt-4.pb-2.px-3(
        v-if="isShowGroupDate"
        @click="isFilterByDay ? setDayDate(date) : null"
      )
        DateTrnsDay(:date="date")

      .overflow-hidden.rounded-md
        TrnsItemBase.py-3.px-3.cursor-pointer(
          v-if="uiHistory"
          v-for="trnId in trnsIds"
          :key="trnId"
          :trnId="trnId"
          @onClickEdit="$emit('onClickEdit')"
        )
        TrnsItemWithoutCat.py-3.px-3.cursor-pointer(
          v-if="uiCat"
          v-for="trnId in trnsIds"
          :actions="actions"
          :key="trnId"
          :trnId="trnId"
        )

  .py-4.pb-6.px-2.flex-center(v-if="!isShowedAllTrns")
    .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-item-main-bg.hocus_bg-item-main-hover(
      class="basis-1/2 max-w-[280px]"
      @click="showMoreTrns"
    ) {{ $t('trns.more') }}
</template>
