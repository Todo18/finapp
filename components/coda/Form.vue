<script setup lang="ts">
import type { ImportForm, FileItem } from '~/components/coda/types'

const props = defineProps<{
  importForm: ImportForm
}>()

const emit = defineEmits(['addFiles', 'afterImport'])

const { importForm } = toRefs(props)
const { $store } = useNuxtApp()

/**
 * Validate
 */
function validate({ values }) {
  /*if (!values.name) {
    $notify({
      title: '😮',
      text: i18n.t('categories.form.name.error'),
    })
    return false
  }

  for (const id in categoriesItems) {
    if (categoriesItems[id].name === values.name && categoriesItems[id].parentId === values.parentId) {
      if (editCategoryId) {
        if (editCategoryId !== id) {
          $notify({
            title: '😮',
            text: i18n.t('categories.form.name.exist'),
          })
          return false
        }
      }
      else {
        $notify({
          title: '😮',
          text: i18n.t('categories.form.name.exist'),
        })
        return false
      }
    }
  }

  return true*/
}

function prepareForm({ values }) {
  /*return {
    color: values.color,
    icon: values.icon,
    name: values.name,
    order: values.order,
    parentId: values.parentId,
    showInLastUsed: categoryChildIds ? false : values.showInLastUsed,
    showInQuickSelector: categoryChildIds ? false : values.showInQuickSelector,
    showStat: categoryChildIds ? false : values.showStat,
  }*/
}

async function onImport() {
  /*const categoriesItems = $store.state.categories.items

  const isFormValid = validate({ values: categoryForm.value, categoriesItems })
  if (!isFormValid)
    return

  const uid = $store.state.user.user.uid
  const categoryChildIds = getChildCategoriesIds(editCategoryId)
  const categoryValues = prepareForm({ values: categoryForm.value, categoryChildIds })

  // Update category
  await saveData(`users/${uid}/categories/${editCategoryId}`, categoryValues)

  // Update child categories colors
  if (isUpdateChildCategoriesColor.value && categoryChildIds) {
    for (const childId of categoryChildIds)
      await saveData(`users/${uid}/categories/${childId}/color`, categoryValues.color)
  }*/

  emit('afterImport')
}

function onFileInput(e) {
  const fileItems = new Array<FileItem>()

  for(const file of e.target.files) {
    fileItems.push({ name: file.name, progress: 0 })
  }

  emit('addFiles', fileItems)
}
</script>

<template lang="pug">
div
  .px-2.max-w-md
    //- Data
    //-----------------------------------
    .mb-4
    .pb-2.text-skin-item-base-down.text-sm.leading-none {{ $t('codaForm.form.files.label') }}
    input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-skin-item-base.bg-skin-item-main-bg.border.border-solid.border-skin-item-main-hover.transition.ease-in-out(
        type="file"
        accept=".coda,*"
        multiple
        @change="onFileInput"
    )

    p(v-for="fileItem of importForm.fileStore.items") {{ fileItem.name }}

    //- Import
    //---------------------------------
    .pt-4.pb-6
      SharedButton(
        :class="['_text-center _blue2 _ml-big', { _inline: $store.state.ui.pc }]"
        :title="$t('codaForm.form.import')"
        @onClick="onImport"
      )
</template>
