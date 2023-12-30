<script setup lang="ts">
// See also: Projecten/firebase-json-viewer-master for a nice little tree overview
import hljs from "highlight.js/lib/common"
import lang from "assets/js/mathjs.js"
import 'highlight.js/styles/tokyo-night-dark.css'
//import TreeChart from "vue-tree-chart-3";
import { getRuleCategory } from '~/components/rules/getRules'

const { $store } = useNuxtApp()

const route = useRoute()
const router = useRouter()

const ruleId = computed(() => route.params.id)
const rule = computed(() => $store.state.rules.items[ruleId.value])
if (!rule.value)
  router.replace('/rules')

const ruleCategory = computed(() =>
  getRuleCategory($store.state.categories.items, rule.value.categoryId))

/*const ruleConditionTree = {
  name: 'root',
  image_url: "https://static.refined-x.com/avat.jpg",
  class: ["rootNode"],
  children: [
    {
      name: 'children1',
      image_url: "https://static.refined-x.com/avat1.jpg"
    },
    {
      name: 'children2',
      image_url: "https://static.refined-x.com/avat2.jpg",
      mate: [{
        name: 'mate',
        image_url: "https://static.refined-x.com/avat3.jpg"
      }],
      children: [
        {
          name: 'grandchild',
          image_url: "https://static.refined-x.com/avat.jpg"
        },
        {
          name: 'grandchild2',
          image_url: "https://static.refined-x.com/avat1.jpg"
        },
        {
          name: 'grandchild3',
          image_url: "https://static.refined-x.com/avat2.jpg"
        }
      ]
    },
    {
      name: 'children3',
      image_url: "https://static.refined-x.com/avat.jpg"
    }
  ]
}*/

const onClickEdit = () => router.push(`/rules/${ruleId.value}/edit`)

hljs.registerLanguage("mathjs", lang)
onMounted(() => hljs.highlightAll())

useHead({
  title: rule.value.name,
})
</script>

<template lang="pug">
UiPage(v-if="rule")
  UiHeader
    router-link(
      v-slot="{ href, navigate }"
      to="/rules"
      custom
    )
      a.grow.hocus_bg-item-main-hover(
        :href="href"
        @click="navigate"
      )
        UiHeaderTitle
          .pt-1.text-xs.font-medium.text-item-base-down
            | {{ $t('rules.title') }}

          .pb-1.flex.items-center.gap-4
            | {{ rule.name }}
            .w-8.h-8.rounded-full.flex-center.text-xl.text-icon-base(
              :style="{ background: ruleCategory.color }"
            )
              div(:class="ruleCategory.icon")

    template(#actions v-if="!ruleId.startsWith('@')")
      UiHeaderLink(@click="onClickEdit")
        .mdi.mdi-pencil-outline.group-hover_text-white.text-xl

  //- Conditional expression
  .mb-12(v-if="rule.condition")
    .pb-3.px-2.flex.gap-2.text-lg.leading-none.font-nunito.font-semibold.text-item-base
      div {{ $t('rules.form.condition.label') }}

    .px-2
      pre
        code.inputCode.language-mathjs(
          style="word-break: normal; white-space: normal;"
        ) {{ rule.condition }}
</template>
