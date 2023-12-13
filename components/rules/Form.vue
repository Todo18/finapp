<script setup lang="ts">
import { Ref } from '@vue/composition-api'
import generateId from '~/utils/id'
import type { RuleForm, RuleID } from '~/components/rules/types'
import type { CategoryID, CategoryItem } from '~/components/categories/types'
import { getPreparedFormData } from '~/components/rules/getForm'
import { saveData } from '~/services/firebase/api'
import { create, all } from 'mathjs'

// TODO: Merge code input in Autocomplete.vue, so we have a CodeInput component, instead of an Autocomplete component
// See validate, but also :values (move context into component !)
const mathjsConfig = { }
const mathjs = create(all, mathjsConfig)
const mathjsDebug = false

const props = defineProps<{
  ruleId?: RuleID
  ruleForm: RuleForm
}>()

const emit = defineEmits(['updateValue', 'afterSave'])

const { ruleId, ruleForm } = toRefs(props)
const { $store, $notify, nuxt2Context: { i18n } } = useNuxtApp()
const editRuleId = ruleId.value ?? generateId()

const activeTab = ref('data')
const activeCategoryRootId: Ref<CategoryID | 0> = ref(0)

const tabs = computed(() => [{
  id: 'data',
  name: i18n.t('base.data'),
}, {
  id: 'category',
  name: i18n.t('rules.form.category.label'),
  //isHidden: !$store.getters['categories/hasCategories'],
}])

/**
 * Select category
 */
 function onCategorySelect(categoryId: CategoryID | 0) {
  if (categoryId === 0) {
    emit('updateValue', 'categoryId', categoryId)
    activeCategoryRootId.value = 0
    return
  }

  const categoryItem: CategoryItem = $store.state.categories.items[categoryId];
  const parentId = categoryItem?.parentId ?? 0

  if (parentId !== 0 || !$store.getters['categories/isCategoryHasChildren'](categoryId)) {
    emit('updateValue', 'categoryId', categoryId)
    activeCategoryRootId.value = parentId
    return
  }

  activeCategoryRootId.value = categoryId
}

/**
 * Validate
 */
function validate({ values, rulesItems }) {
  if (!values.name) {
    $notify({
      title: '😮',
      text: i18n.t('rules.form.name.error'),
    })
    return
  }

  // Parse expression, throw on error
  try
  {
    const root = mathjs.parse(values.condition)

    // Only one (expression) statement allowed!
    if (root.type === 'BlockNode') throw new SyntaxError()
  }
  catch(ex) {
    $notify({
      title: '😮',
      text: i18n.t('rules.form.condition.error'),
    })
    return
  }

  // TODO: refactor
  for (const id in rulesItems) {
    if (rulesItems[id].name === values.name) {
      if (editRuleId) {
        if (editRuleId !== id) {
          $notify({
            title: '😮',
            text: i18n.t('rules.form.name.exist'),
          })
          return
        }
      }
      else {
        $notify({
          title: '😮',
          text: i18n.t('rules.form.name.exist'),
        })
        return
      }
    }
  }

  return true
}

async function onSave() {
  const rulesItems = $store.state.rules.items

  const isFormValid = validate({ values: ruleForm.value, rulesItems })
  if (!isFormValid)
    return

  const uid = $store.state.user.user.uid
  const ruleValues = getPreparedFormData(ruleForm.value)

  // Update category
  await saveData(`users/${uid}/rules/${editRuleId}`, ruleValues)

  emit('afterSave')
}
</script>

<template lang="pug">
div
  .sticky.z-20.backdrop-blur.firefoxBackdropFix(
    class="top-[60px] bg-white/70 dark_bg-dark3/70"
  )
    .px-2
      UiTabs2
        UiTabsItem2.md_text-lg(
          v-for="tab in tabs"
          v-if="!tab.isHidden"
          :key="tab.id"
          :isActive="activeTab === tab.id"
          @click="activeTab = tab.id"
        ) {{ tab.name }}

  //- Content
  //-----------------------------------
  .pt-8.px-2.max-w-md
    //- Data
    //-----------------------------------
    template(v-if="activeTab === 'data'")
      .mb-4
        .pb-2.text-skin-item-base-down.text-sm.leading-none {{ $t('rules.form.name.label') }}
        input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-skin-item-base.bg-skin-item-main-bg.border.border-solid.border-skin-item-main-hover.placeholder_text-skin-item-base-down.transition.ease-in-out.focus_text-skin-item-base-up.focus_bg-skin-item-main-hover.focus_border-blue3.focus_outline-none(
          :placeholder="$t('rules.form.name.placeholder')"
          :value="ruleForm.name"
          type="text"
          @input="event => emit('updateValue', 'name', event.target.value)"
        )

      .mb-4
        .pb-2.text-skin-item-base-down.text-sm.leading-none {{ $t('rules.form.condition.label') }}
        SharedAutocomplete(
          :placeholder="$t('rules.form.condition.placeholder')"
          :value="ruleForm.condition"
          @__input="event => emit('updateValue', 'condition', event.target.value)"
          @update="value => emit('updateValue', 'condition', value)"
        )

    //- Parent
    //---------------------------------
    template(v-if="activeTab === 'category'")
      .cursor-pointer.mb-4.py-3.px-2.gap-x-3.flex-center.rounded-md.text-center.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
        :class="{ '!cursor-default !bg-skin-item-main-active': ruleForm.categoryId === 0 }"
        @click="onCategorySelect(0)"
      ) {{ $t('rules.form.category.no') }}
      template(v-if="activeCategoryRootId === 0")
        CategoriesList(
          :activeItemId="ruleForm.categoryId"
          :ids="$store.getters['categories/categoriesRootIds']"
          :slider="() => ({})"
          class="!gap-x-1"
          @onClick="onCategorySelect"
        )
      template(v-if="activeCategoryRootId !== 0")
        CategoriesList(
          :activeItemId="ruleForm.categoryId"
          :ids="$store.getters['categories/getChildCategoriesIds'](activeCategoryRootId)"
          :slider="() => ({})"
          class="!gap-x-1"
          @onClick="onCategorySelect"
        )
    
    //- Save
    //---------------------------------
    .pt-4.pb-6
      SharedButton(
        :class="['_text-center _blue2 _ml-big', { _inline: $store.state.ui.pc }]"
        :title="$t('rules.form.save')"
        @onClick="onSave"
      )
</template>
