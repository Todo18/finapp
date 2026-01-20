<script setup lang="ts">
import type { TrnId } from '~/components/trns/types'
import useFilter from '~/components/filter/useFilter'
import useTrn from '~/components/trns/item/useTrn'
import { useTrnForm, useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  trnId: TrnId
  slider?: any
}>()
const emit = defineEmits(['onClickEdit', 'onClickEditCategory'])

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()
const { trnFormEdit } = useTrnForm()

const { setFilterCatsId } = useFilter()
const { formatTrnItem } = useTrn()
const trnItem = computed(() => formatTrnItem(props.trnId))

const actions = {
  onOpenDetails: () => {
    if (!$store.state.trns.modal.show) {
      $store.commit('trns/showTrnModal')
      $store.commit('trns/setTrnModalId', trnItem.value.id)
    }
  },

  onOpenEdit: (event) => {
    event.stopPropagation()

    if (props.slider)
      props.slider.slideTo(1)

    trnFormEdit(props.trnId)
    emit('onClickEdit', props.trnId)
  },

  onOpenEditCategory: (event) => {
    event.stopPropagation()

    if (props.slider)
      props.slider.slideTo(1)

    trnFormEdit(props.trnId)
    $trnForm.ui.catsRootModal = true
    emit('onClickEditCategory', props.trnId)
  },

  // TODO: useFilter
  onSetFilter: (event) => {
    if (props.slider)
      return

    event.stopPropagation()
    setFilterCatsId(trnItem.value.categoryId)
    $store.commit('filter/setFilterDateNow')
    $store.commit('trns/hideTrnModal')
    $store.commit('trns/setTrnModalId', null)
    if ($store.state.ui.activeTabStat !== 'trns')
      $store.dispatch('ui/setActiveTabStat', 'details')
  },
}
</script>

<template lang="pug">
.trnItem.space-x-3.flex.cursor-context-menu.hocus_bg-neutral-100.dark_hocus_bg-neutral-800(
)
  .text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
    :style="{ background: trnItem.category.color }"
    :class="[{ 'cursor-pointer': !slider }]"
    @click="actions.onOpenEditCategory"
  ): div(:class="trnItem.category.icon")

  .grow(
    @click="actions.onOpenDetails"
  )
    .items-center.flex
      .grow.text-neutral-500.dark_text-neutral-500
        //- Category
        .pb-1.space-x-2.items-baseline.flex.flex-wrap
          .text-sm.text-neutral-700.dark_text-neutral-300 {{ trnItem.category.name }}

          .text-xs.space-x-2.items-baseline.flex(v-if="trnItem.category.parentId")
            div •
            div {{ trnItem.categoryParent.name }}

          .text-xs.label(
            v-for="label in trnItem.labels"
            :class="label"
            :title="label === 'rule' ? trnItem.ruleName : undefined"
          ) {{ $t(`labels.${label}`) }}

          .text-xs.label.edited(
            v-if="trnItem.created && trnItem.created !== trnItem.edited"
          ) {{ $t(`labels.edited`) }}

        //- Group
        .text-xs.leading-none(v-if="trnItem.groups") In group

        //- Wallet
        .text-xs.leading-none(v-if="trnItem.type !== 2") {{ trnItem.wallet.name }}

        //- Transfer
        .flex.wrap.gap-4.text-xs.text-left(v-if="trnItem.type === 2")
          //- Expense
          div
            .space-x-1.items-center.flex
              div {{ $t('trnForm.transfer.from') }}:
              .text-neutral-500.dark_text-neutral-400 {{ trnItem.expenseWallet.name }}

            .text-base(
              @click="actions.onOpenEdit"
            )
              Amount(
                :amount="trnItem.expenseAmount || trnItem.amount"
                :currencyCode="trnItem.expenseWallet.currency"
                :type="0"
                colorize="expense"
              )

          //- Income
          div
            .space-x-1.items-center.flex
              div {{ $t('trnForm.transfer.to') }}:
              .text-neutral-500.dark_text-neutral-400 {{ trnItem.incomeWallet.name }}

            .text-base(
              @click="actions.onOpenEdit"
            )
              Amount(
                :amount="trnItem.incomeAmount || trnItem.amount"
                :currencyCode="trnItem.incomeWallet.currency"
                :type="1"
                colorize="income"
              )

      //- Amount
      .cursor-pointer(
        v-if="trnItem.type !== 2"
        @click="actions.onOpenEdit"
      )
        Amount(
          :amount="trnItem.amount"
          :currencyCode="trnItem.wallet.currency"
          :type="trnItem.type"
          colorize="income"
        )

    //- Description
    .pt-2.text-neutral-500.text-xs.leading-none(v-if="trnItem.desc || trnItem.description")
      | {{ trnItem.desc || trnItem.description }}
</template>

<style lang="stylus" scoped>
.trnItem
  .label
    font-size 10px
    padding 0px 8px
    border-radius 12px
    text-align center
    color var(--c-font-2)

  .enriched
    background rgb(251, 192, 45)

  .imported
    background rgb(38, 166, 154)

  .rule
    background rgb(171, 71, 188)

  .edited
    background rgb(100, 181, 246)
</style>