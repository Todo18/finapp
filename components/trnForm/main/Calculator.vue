<script setup lang="ts">
import vue from 'vue'
import { onLongPress } from '@vueuse/core'
import { createExpressionString } from '~/components/trnForm/utils/calculate'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import azure_api from '~/services/azure/api';
import { TrnType } from '~/components/trns/types';
import { formatInput } from '~/components/trnForm/utils/calculate'
import useAmount from '~/components/amount/useAmount'
import { addLabel } from '~/components/trnForm/utils/label'

const props = defineProps<{
  amountRaw: string
}>()

const emit = defineEmits<{
  (e: 'onChange', value: string): string
}>()

const { $store, $notify } = useNuxtApp()
const $trnForm = useTrnFormStore()

const { baseCurrencyCode, getAmountInBaseRate } = useAmount()

const buttons = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
]

// ['*', '7', '8', '9'],
//   ['+', '4', '5', '6'],
//   ['-', '1', '2', '3'],
//   ['/', '.', '0', 'c'],

function onClick(key: string) {
  const value = createExpressionString(key, props.amountRaw)
  emit('onChange', value)
}

function getClassName(btnIdx: number, rowIdx: number, row: string[]) {
  return {
    'bg-opacity-60': btnIdx === 0 || (rowIdx === row.length - 1 && (btnIdx === 1 || btnIdx === 3)),
  }
}

const deleteBtnRef = ref<HTMLElement | null>(null)

onLongPress(
  deleteBtnRef,
  () => {
    $trnForm.$patch((state) => {
      state.values.amount = [0, 0, 0]
      state.values.amountRaw = ['0', '0', '0']
    })
  },
  { modifiers: { prevent: false } },
)

function adhocUploadReceipt() {
  // Create a temporary file input element and trigger the click event
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = function (e) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    $trnForm.values.receipt = file

    // TODO: Put this behind a setting (maybe we don't want this for all users)
    $store.commit('trnForm/showTrnFormModal', 'extraction')

    const reader = new FileReader()
    reader.onload = (e) => {
      // FIXME: Should probably move this to server
      const prompt = `Extract information from the receipt provided. Today's date is ${new Date().toISOString().split('T')[0]}.`
      const schema = {
        type: "object",
        properties: {
          amount: {
            description: "The total, payable amount of the receipt",
            type: "number"
          },
          currency: {
            description: "The currency of the amount, in ISO 4217 format (e.g. USD)",
            type: "string"
          },
          date: {
            description: "The date of the receipt, in ISO 8601 format (YYYY-MM-DD)",
            type: "string"
          },
          description: {
            description: "A short description of the receipt",
            type: "string"
          },
        },
        // required: ["amount", "currency", "date"],
        additionalProperties: false
      }
      const auth = {
        uid: $store.state.user.user.uid,
      }
      // const image = {
      //   type: 'input_file',
      //   filename: file.name,
      //   file_data: e.target?.result,
      // }
      const image = {
        type: 'image_url',
        image_url: {
          url: e.target?.result,
        }
      }
      azure_api.getResponse(prompt, [image], schema, auth).then((res: any) => {
        if (!res.amount || !res.currency || !res.date) {
          throw new Error("Invalid response, or not sufficient information")
        }
        let amount = res.amount
        if (res.currency !== baseCurrencyCode.value) {
          // Convert to base rate
          amount = getAmountInBaseRate({
            amount,
            currencyCode: res.currency,
            noFormat: true,
          })
        }
        $trnForm.values.trnType = TrnType.Expense
        vue.set($trnForm.values.amount, 0, amount)
        vue.set($trnForm.values.amountRaw, 0, formatInput(amount))
        const parsedDate = Date.parse(res.date)
        // Check if the date is valid and within the last 90 days
        if (isNaN(parsedDate) || parsedDate - Date.now() > 0 || Date.now() - parsedDate > 1000 * 60 * 60 * 24 * 90) {
          throw new Error("Invalid date: " + res.date)
        }
        $trnForm.values.date = parsedDate
        if (res.description && !$trnForm.values.desc) $trnForm.values.desc = res.description
        // TODO: Implement
        // $trnForm.values.categoryId = res.categoryId
        // For now, only add the label when we haven't seen the result before
        // addLabel($trnForm.values, "enriched")
      }).catch((e: Error) => {
        $notify({
          title: 'Enrichment failed',
          text: e.message,
          type: 'error',
        })
      }).finally(() => {
        $store.commit('trnForm/closeTrnFormModal', 'extraction')
      })
    }
    reader.onerror = (e) => {
      $store.commit('trnForm/closeTrnFormModal', 'extraction')
    }
    reader.readAsDataURL(file)

    input.remove()
  }
  input.oncancel = function () {
    // Destroy input element again
    input.remove()
  }
  input.click()
}
</script>

<template lang="pug">
.px-2.grid.gap-0(class="grid-cols-[auto,1fr,auto]")
  .w-20.flex.flex-col.gap-2
    TrnFormMainCalculatorButton(@click="onClick('*')"): .mdi.mdi-plus.rotate-45
    TrnFormMainCalculatorButton(@click="onClick('-')"): .mdi.mdi-minus
    TrnFormMainCalculatorButton(@click="onClick('+')"): .mdi.mdi-plus
    TrnFormMainCalculatorButton(@click="onClick('/')"): .mdi.mdi-slash-forward

  .flex.flex-col.gap-2
    .flex.gap-2.justify-center(
      v-for="(row, rowIdx) in buttons"
      :key="rowIdx"
    )
      TrnFormMainCalculatorButton(
        v-for="(btn, btnIdx) in row"
        :key="btn"
        :class="getClassName(btnIdx, rowIdx, row)"
        @click="onClick(btn)"
      ) {{ btn }}

    .flex.gap-2.justify-center
      TrnFormMainCalculatorButton(@click="onClick('.')") .
      TrnFormMainCalculatorButton(@click="onClick('0')") 0
      TrnFormMainCalculatorButton(
        ref="deleteBtnRef"
        @click="onClick('c')"
      ) c

  .w-20.grid.gap-2.justify-items-end(class="grid-rows-[auto,1fr]")
    //- Description
    TrnFormMainCalculatorButton(
      :class="{ 'text-accent-default': !!$trnForm.values.desc }"
      @click="$store.commit('trnForm/showTrnFormModal', 'description')"
    ): .mdi.mdi-comment-text-outline

    //- Receipt
    TrnFormMainCalculatorButton(
      :class="{ 'text-accent-default': !!$trnForm.values.receiptUrl }"
      @click="adhocUploadReceipt"
    ): .mdi.mdi-receipt-text-outline

    //- Action
    TrnFormMainActionSide
</template>
