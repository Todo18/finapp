<script setup lang="ts">
import type { ImportForm, FileItem } from '~/components/coda/types'

const router = useRouter()

const importForm = ref<ImportForm>({
  fileStore: {
    items: new Array<FileItem>()
  }
})

function addFiles(fileItems: Array<FileItem>) {
  importForm.value.fileStore.items.push(...fileItems);
}

function afterImport() {
  router.push('/history/')
}
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: this.$t('codaForm.title')//: ${this.wallet.name}
    }
  },
})
</script>

<template lang="pug">
UiPage
  UiHeader
    UiHeaderTitle
      .pb-1.text-xs.font-medium.text-skin-item-base-down
        | {{ $t("codaForm.title") }}

      .flex.items-center
        .text-skin-item-base-up.text-2xl.font-semibold
        | {{ $t("codaForm.import") }}

  CodaForm(
    :importForm="importForm"
    @addFiles="addFiles"
    @afterImport="afterImport"
  )</template>
