<script>
export default {
  setup() {
    const contextMenuOpener = ref()

    return {
      contextMenuOpener,
    }
  },

  props: {
    visible: { type: Boolean, default: false },
    position: { type: Object, default: () => {} },
  },

  mounted() {
    //this.anchor = { clientRect: this.contextMenuOpener.getBoundingClientRect() }
    //clientRect = this.$slots.opener[0].elm?.getBoundingClientRect()
  },

  computed: {
    className() {
      return {
        _bottom: this.position && this.position.bottom,
        _right: this.position && this.position.right,
        _top: this.position && this.position.top,
      }
    },

    positionStyles() {
      const styles = {}
      let clientRect = {}

      if (this.contextMenuOpener) clientRect = this.contextMenuOpener.getBoundingClientRect()
      //or: clientRect = this.$slots.opener[0].elm?.getBoundingClientRect()

      if (this.position.top && typeof this.position.top === 'string') {
        styles.top = this.position.top === 'computed' ? `${clientRect.height ?? 48}px` : this.position.top
      }
      if (this.position && this.position.left && typeof this.position.left === 'string') {
        styles.left = this.position.left
        styles.maxWidth = `${this.$store.state.ui.width - 24}px`
      }
      if (this.position && this.position.right && typeof this.position.right === 'string') {
        styles.right = this.position.right
        styles.maxWidth = `${this.$store.state.ui.width - 24}px`
      }

      return styles
    },
  },
}
</script>

<template lang="pug">
.context-menu
  transition(name="slide2")
    .context-menu__popup(
      v-if="$slots.content"
      v-show="visible"
      :class="className"
      :style="positionStyles"
    )
      transition(name="slide2")
        .context-menu__overflow(
          v-if="$slots.content"
          @click="$emit('onClickOpener')"
        )

      .context-menu__content
        slot(name="content")
      .context-menu__desc(v-if="$slots.desc")
        slot(name="desc")

  .context-menu__opener(
    ref="contextMenuOpener"
    @click="$emit('onClickOpener')"
  )
    template(v-if="$slots.opener")
      slot(name="opener")
    template(v-else)
      .d-button._noPadding._grey: .mdi.mdi-tune
</template>

<style lang="stylus" scoped>
.context-menu
  z-index 6
  position relative
  width 100%

  &__opener
    z-index 22
    position relative

  &__overflow
    z-index 11
    position fixed
    top 0
    left 0
    width 100%
    height 100%

  &__popup
    overflow hidden
    z-index 10
    position absolute
    top 48px
    min-width 360px
    background var(--c-bg-4) /* NAD: This was --c-bg-5, same color as :hover... */
    border 1px solid var(--c-bg-1)
    border-radius $m6

    /.light &
      background var(--c-bg-1)
      border 1px solid var(--c-bg-5)

    &._right
      right 0

    &._bottom
      top inherit
      bottom 48px

  &__content
    z-index 200
    position relative

  &__desc
    display flex
    align-items center
    padding 10px 16px
    color var(--c-font-4)
    font-size 11px
    background var(--c-bg-4)
    border-top 1px solid var(--c-bg-6)
</style>
