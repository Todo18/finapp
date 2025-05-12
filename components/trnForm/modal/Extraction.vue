<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()

function cancel(close: () => void) {
  // TODO: Implement
  close()
}

function closed() {
  $store.commit('trnForm/closeTrnFormModal', 'extraction')
}
</script>

<template lang="pug">
TrnFormModal(@closed="closed")
  template(#header)
    template {{ $t('trnForm.extraction.title') }}

  template(#default="{ close }")
    .pb-2.text-item-base.text-center {{ $t('trnForm.extraction.status') }}

    .pb-4.px-3
      UiButtonGrey(
        @click="cancel(close)"
      ) {{ $t('base.cancel') }}
</template>
