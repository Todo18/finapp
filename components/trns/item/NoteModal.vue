<script lang="ts">
export default {
  setup() {
    const { $store } = useNuxtApp()

    const closed = () => $store.commit('trns/closeTrnNoteModal')

    //const blob = computed(() => $store.state.trns.noteModal.blob)
    //const blobUrl = computed(() => window.URL.createObjectURL($store.state.trns.noteModal.blob))
    const blobUri = computed(() => $store.state.trns.noteModal.blobUri)

    return {
      blobUri,
      closed,
    }
  },
}
</script>

<template lang="pug">
Portal(
  key="TrnsNoteModal"
  v-if="$store.state.trns.noteModal.show"
  to="modal"
)
  LazyBaseBottomSheet(
    v-if="$store.state.trns.noteModal.show"
    key="TrnsNoteModal"
    @closed="closed"
  )
    template(#handler="{ close }")
      BaseBottomSheetClose(@onClick="close")

    template(#header)
      .header
        //-.trnNoteHeader.py-3.px-3
          //-.trnNoteHeader__title {{ $t('trnForm.note.title') }}

    template(#default="{ close }")
      .content.pb-4
        //- TODO: alt text (maybe trn description ??)
        div.trnNoteContainer
          img.trnNote(
            alt=""
            crossorigin="anonymous"
            :style="{ height: `${$store.state.ui.height * 2/3}px` }"
            :src="blobUri"
          )
        .pt-4.px-4.flex-center
          .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
            class="basis-1/2 max-w-[280px]"
            @click="close()"
          ) {{ $t('close') }}
</template>

<style lang="stylus" scoped>
.header
  flex-grow 1
  position relative
  display flex
  align-items center
  justify-content center
  padding $m7
  padding-bottom $m9
  color var(--c-font-2)
  fontFamilyNunito()
  background var(--c-bg-3)
  border-radius $m7 $m7 0 0

.content
  background var(--c-bg-3)
  +media(600px)
    border-radius 0 0 $m7 $m7

.trnNoteContainer
  margin 0
  padding 0

img.trnNote
  display block /* block, to be able to use margin = auto */
  width auto
  object-fit scale-down
  margin 0 auto
  padding 0
</style>
