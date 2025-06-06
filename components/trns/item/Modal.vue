<script lang="ts">
import useFilter from '~/components/filter/useFilter'
import useTrn from '~/components/trns/item/useTrn'
import { useTrnForm } from '~/components/trnForm/useTrnForm'

function getExtension(uri) {
  const filename = new URL(uri).pathname
  return filename.slice((filename.split('?')[0].lastIndexOf('.') - 1 >>> 0) + 2)
}

// TODO: useFilter
export default {
  setup() {
    const { $store } = useNuxtApp()
    const { trnFormEdit, trnFormDuplicate } = useTrnForm()
    const { setFilterCatsId, setFilterWalletsId } = useFilter()

    const router = useRouter()

    const closed = () => {
      $store.commit('trns/hideTrnModal')
      $store.commit('trns/setTrnModalId', null)
    }

    const { formatTrnItem } = useTrn()
    const trnItem = computed(() => formatTrnItem($store.state.trns.modal.id))

    return {
      trnItem,
      setFilterCatsId,
      setFilterWalletsId,
      closed,
      trnFormEdit,
      trnFormDuplicate,
    }
  },

  data() {
    return {
      showModalConfirm: false,
      showModalGroups: false,
    }
  },

  computed: {
    trnId() {
      return this.$store.state.trns.modal.id
    },

    category() {
      return this.$store.state.categories.items[this.$store.state.trns.items[this.trnId].categoryId]
    },

    wallet() {
      return this.$store.state.wallets.items[this.$store.state.trns.items[this.trnId].walletId]
    },

    receipt() {
      return this.trnItem.receiptUri
    },
  },

  methods: {
    handleSetFilterCategory() {
      this.setFilterCatsId(this.$store.state.trns.items[this.trnId].categoryId)
      this.$store.commit('filter/setFilterDateNow')
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$store.dispatch('ui/setActiveTabStat', 'details')
    },

    handleSetFilterWallet() {
      this.setFilterWalletsId(this.$store.state.trns.items[this.trnId].walletId)
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$store.commit('filter/setFilterDateNow')
      this.$store.dispatch('ui/setActiveTabStat', 'details')
    },

    handleDuplicateTrn() {
      const trnId = this.trnId
      console.log('trnId', trnId)
      this.trnFormDuplicate(trnId)
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
    },

    handleEditClick() {
      const trnId = this.trnId
      this.trnFormEdit(trnId)
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)

      // setExpression(trn.type === 2 && trn.incomeAmount ? trn.incomeAmount : trn.amount)
    },

    handleDeleteClick() {
      this.showModalConfirm = true
    },

    handleDeleteConfirm() {
      const trnId = this.trnId
      setTimeout(() => {
        this.$store.dispatch('trns/deleteTrn', trnId)
      }, 100)

      this.showModalConfirm = false
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
    },

    handleNewRuleClick() {
      const trn = this.trnItem
      this.$store.commit('rules/setNewRuleFromTrn', trn)
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$router.push('/rules/new')
    },

    handleShowReceipt() {
      const uri = this.trnItem.receiptUri

      // If not an image (e.g. a pdf), just open the link in an external window
      // NAD: For the moment we'll always do this, because we need to activate cors first (see: useTrn.formatTrnItem)
      // if (!["jfif","jpe","jpeg","jpg","png"].includes(getExtension(uri))) {
      window.open(uri, '_blank')
      //  return
      // }

      // Otherwise, show inline!
      // this.$store.commit('trns/showTrnNoteModal', uri)
    },
  },
}
</script>

<template lang="pug">
Portal(
  key="TrnsItemModal"
  v-if="$store.state.trns.modal.show"
  to="modal"
)
  LazyBaseBottomSheet(
    v-if="$store.state.trns.modal.show"
    key="TrnsItemModal"
    @closed="closed"
  )
    template(#handler="{ close }")
      BaseBottomSheetClose(@onClick="close")

    template(#header)
      .header
        TrnsItemDetails(
          :category="category"
          :trn="trnItem"
          :trnId="trnId"
          :wallet="wallet"
          ui="detailed"
        )

    template(#default="{ close }")
      .content.pb-4
        .tools
          .modalLinks
            ModalButton(
              :name="$t('base.delete')"
              icon="mdi mdi-delete-empty-outline"
              @onClick="handleDeleteClick"
            )

            ModalButton(
              :name="$t('base.edit')"
              icon="mdi mdi-pencil-outline"
              @onClick="handleEditClick"
            )

            ModalButton(
              v-if="false"
              :name="$t('base.duplicate')"
              icon="mdi mdi-content-copy"
              @onClick="handleDuplicateTrn"
            )

            ModalButton(
              v-if="true"
              :name="$t('rules.new')"
              icon="mdi mdi-playlist-plus"
              @onClick="handleNewRuleClick"
            )

            ModalButton(
              :name="`${$t('base.setFilter')} ${category.name}`"
              @onClick="handleSetFilterCategory"
            )
              template(#icon)
                Icon(
                  :icon="category.icon"
                  :background="category.color"
                  round
                )

            ModalButton(
              v-if="wallet"
              :name="`${$t('base.setFilter')} ${wallet.name}`"
              @onClick="handleSetFilterWallet"
            )
              template(#icon)
                Icon(
                  :abbr="wallet.name"
                  :background="wallet.color"
                )

            ModalButton(
              v-if="receipt"
              :name="$t('trnForm.receipt.title')"
              icon="mdi mdi-receipt-text-outline"
              @onClick="handleShowReceipt"
            )

        .pt-4.px-4.flex-center
          .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-item-main-bg.hocus_bg-item-main-hover(
            class="basis-1/2 max-w-[280px]"
            @click="close()"
          ) {{ $t('close') }}

  //- delete confirm
  ModalBottomConfirm(
    :show="showModalConfirm"
    @closed="showModalConfirm = false"
    @onConfirm="handleDeleteConfirm"
  )
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
</style>
