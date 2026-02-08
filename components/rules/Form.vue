<script setup lang="ts">
import { type Ref } from 'vue'
import { generateId } from '~/utils/generateId'
import type { RuleForm, RuleID } from '~/components/rules/types'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { getPreparedFormData } from '~/components/rules/getForm'
import { saveData } from '~/services/firebase/api'
import { create, all } from 'mathjs'
import dayjs from 'dayjs'

// TODO: Merge code input in Autocomplete.vue, so we have a CodeInput component, instead of an Autocomplete component
// See validate, but also :values (move context into component !)
const mathjsConfig = { }
const mathjs = create(all, mathjsConfig)
const mathjsDebug = false

// FIXME: Move to a separate file, shared between frontend and daemon worker
const mathjsExtensions = {
    isEmpty: function (v: any) {
        return !v;
    },
    isEqual: function (v: any, w: any) {
        return v === w;
    },
    startsWith: function (haystack: string, needle: string) {
        return haystack.slice(0, needle.length) === needle;
    },
    endsWith: function (haystack: string, needle: string) {
        return haystack.slice(haystack.length - needle.length, haystack.length) === needle;
    },
    contains: function (haystack: string, needle: string) {
        return haystack.includes(needle);
    },
    getDate: function (v: any) {
        return dayjs(v).date();
    },
};

mathjs.import(mathjsExtensions);

const props = defineProps<{
  ruleId?: RuleID
  ruleForm: RuleForm
}>()

const emit = defineEmits(['updateValue', 'afterSave'])

const { ruleId, ruleForm } = toRefs(props)
const { $store, $notify, nuxt2Context: { i18n } } = useNuxtApp()
const editRuleId = ruleId?.value ?? generateId()

const activeTab = ref('data')
const activeCategoryRootId: Ref<CategoryId | 0> = ref(0)

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
 function onCategorySelect(categoryId: CategoryId | 0, _: boolean) {
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

    // Evaluate to catch more errors
    mathjs.evaluate(values.condition, {
      accountNumber: "ACCOUNT_NUMBER",
      currency: "ANY",
      date: dayjs().valueOf(),
      amount: 42,
      desc: "DESC",
      description: "DESCRIPTION",
      accountNumberCounterparty: "ACCOUNT_NUMBER_COUNTERPARTY",
      accountNameCounterparty: "ACCOUNT_NAME_COUNTERPARTY",
      structuredCommunication: "STRUCTURED_COMMUNICATION",
      freeCommunication: "FREE_COMMUNICATION",
    })
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
      UiTabs
        UiTabsItem.md_text-lg(
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
        .pb-2.text-item-base-down.text-sm.leading-none {{ $t('rules.form.name.label') }}
        input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-item-base.bg-item-main-bg.border.border-solid.border-item-main-hover.placeholder_text-item-base-down.transition.ease-in-out.focus_text-item-base-up.focus_bg-item-main-hover.focus_border-blue3.focus_outline-none(
          :placeholder="$t('rules.form.name.placeholder')"
          :value="ruleForm.name"
          type="text"
          @input="event => emit('updateValue', 'name', event.target.value)"
        )

      .mb-4
        .pb-2.text-item-base-down.text-sm.leading-none {{ $t('rules.form.condition.label') }}
        SharedAutocomplete(
          :placeholder="$t('rules.form.condition.placeholder')"
          :value="ruleForm.condition"
          @__input="event => emit('updateValue', 'condition', event.target.value)"
          @update="value => emit('updateValue', 'condition', value)"
        )

    //- Category
    //---------------------------------
    template(v-if="activeTab === 'category'")
      .cursor-pointer.mb-4.py-3.px-2.gap-x-3.flex-center.rounded-md.text-center.bg-item-main-bg.hocus_bg-item-main-hover(
        :class="{ '!cursor-default !bg-item-main-active': ruleForm.categoryId === 0 }"
        @click="onCategorySelect(0)"
      ) {{ $t('rules.form.category.no') }}
      template(v-if="activeCategoryRootId === 0")
        CategoriesList(
          :activeItemId="ruleForm.categoryId"
          :ids="$store.getters['categories/categoriesRootIds']"
          :slider="() => ({})"
          class="!gap-x-1"
          @click="onCategorySelect"
        )
      template(v-if="activeCategoryRootId !== 0")
        CategoriesList(
          :activeItemId="ruleForm.categoryId"
          :ids="$store.getters['categories/getChildCategoriesIds'](activeCategoryRootId)"
          :slider="() => ({})"
          class="!gap-x-1"
          @click="onCategorySelect"
        )
    
    //- Save
    //---------------------------------
    .pt-4.pb-6.flex-center
      UiButtonBlue(
        maxWidth
        @click="onSave"
      ) {{ $t('base.save') }}
</template>
