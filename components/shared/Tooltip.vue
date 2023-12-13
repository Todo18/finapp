<script>
export default {
  props: {
    visible: { type: Boolean, default: false },
    position: { type: Object, default: () => {} },
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
      if (this.position && this.position.left && typeof this.position.left === 'string') {
        return {
          left: this.position.left,
          maxWidth: `${this.$store.state.ui.width - 24}px`,
        }
      }
      if (this.position && this.position.right && typeof this.position.right === 'string') {
        if (this.position.top && typeof this.position.top === 'string') {
          return {
            right: this.position.right,
            top: this.position.top,
            maxWidth: `${this.$store.state.ui.width - 24}px`,
          }
        }
        return {
          right: this.position.right,
          maxWidth: `${this.$store.state.ui.width - 24}px`,
        }
      }

      return null
    },
  },
}
</script>

<template lang="pug">
.tooltip
  transition(name="slide2")
    .tooltip__popup(
      v-show="visible"
      :class="className"
      :style="positionStyles"
    )
      transition(name="slide2")
        .tooltip__overflow(
          v-if="$slots.content"
        )

      .tooltip__content.grow.my-2
        slot(name="content")
      .tooltip__desc(v-if="$slots.desc")
        slot(name="desc")
</template>

<style lang="stylus" scoped>
.tooltip
  z-index 6
  position relative
  width 100%

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
    background var(--c-bg-4)
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
    align-items center
    position relative
    display flex
    flex-grow 1
    width 100%
    max-width inherit
    min-height 44px
    padding 0 $m6
    color var(--c-font-3)
    font-size 14px
  
    @media $media-laptop
      max-width 320px
      min-height 38px
  
  &__desc
    display flex
    align-items left
    padding 10px 16px
    color var(--c-font-4)
    font-size 11px
    background var(--c-bg-4)
    border-top 1px solid var(--c-bg-6)
</style>
