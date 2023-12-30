<script setup lang="ts">
import { errorEmo, random, successEmo } from '~/assets/js/emo'
import { removeData } from '~/services/firebase/api'
import type { RuleID } from '~/components/rules/types'

const props = defineProps<{
  ruleId: RuleID
}>()

const { $store, $notify, nuxt2Context: { i18n } } = useNuxtApp()
const router = useRouter()

const { ruleId } = toRefs(props)
const rule = computed(() => $store.state.rules.items[ruleId.value])

const isShowDeleteConfirm = ref(false)

async function onDeleteConfirm() {
  // Disable reactive when user has already redirected to categories page
  const uid = JSON.parse(JSON.stringify($store.state.user.user.uid))
  const ruleIdS = JSON.parse(JSON.stringify(ruleId.value))

  router.push('/rules')

  // Give some time to complete redirect
  setTimeout(() => {
    removeData(`users/${uid}/rules/${ruleIdS}`)
      .then(() => {
        $notify({
          type: 'success',
          text: i18n.t('rules.deletedSuccess'),
          title: random(successEmo),
        })
      })
  }, 100)
}
</script>

<template lang="pug">
div
  UiHeaderLink(@click="isShowDeleteConfirm = true")
    .mdi.mdi-delete-empty-outline.group-hover_text-white.text-xl

  ModalBottomConfirm(
    :show="isShowDeleteConfirm"
    :description="null"
    @onClose="isShowDeleteConfirm = false"
    @onConfirm="onDeleteConfirm"
  )
</template>
