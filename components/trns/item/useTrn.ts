import { getObjectURI } from '~/services/firebase/api'
import { formatDate } from '~/utils/formatDate'

export default function useTrn() {
  const { $store } = useNuxtApp()

  function formatTrnItem(id) {
    try {
      const { trns, wallets, categories, user } = $store.state
      const uid = user.user.uid

      if (!trns?.items || !wallets?.items || !categories?.items)
        return 'Something missing'

      // Trn
      const trn = trns.items[id]
      if (!trn)
        return 'Trn not found'

      // Category
      const category = categories.items[trn.categoryId]
      if (!category)
        return 'Category not found'

      // Parent category
      let categoryParent = null
      if (category.parentId) {
        categoryParent = categories.items[category.parentId]
        if (!categoryParent)
          return 'Parent Category not found'
      }

      // Date
      let dateFormatted = formatDate(trn.date, 'full')
      // @ts-expect-error todo
      dateFormatted = `${dateFormatted.weekday}, ${dateFormatted.day} ${dateFormatted.month} ${dateFormatted.year}`

      // Transaction
      if (trn.type !== 2) {
        // Wallet
        const wallet = wallets.items[trn.walletId]
        if (!wallet)
          return 'Wallet not found'

        const formattedTrn = {
          id,
          ...trn,
          dateFormatted,
          category,
          categoryParent,
          wallet,
        }

        if (trn.noteBlob != null) {
          // Let the user know there's something there
          formattedTrn.noteUri = '#'

          // Reset, because we don't want to make any mistakes when editing & saving the original trn
          // NAD: For the moment we can't support edits, because we need to activate cors first (see further)
          formattedTrn.noteBlob = null

          // Just start the download, we'll see it when we get there
          /*const img = new Image()
          const c = document.createElement("canvas")
          const ctx = c.getContext("2d")
          
          img.onload = function() {
            c.width = this.naturalWidth;     // update canvas size to match image
            c.height = this.naturalHeight;
            ctx.drawImage(this, 0, 0);       // draw in image
            c.toBlob(function(blob) {        // get content as JPEG blob
              // here the image is a blob
              formattedTrn.noteBlob = blob
            }, "image/jpeg", 0.75);
          };
          //img.crossOrigin = "";              // if from different origin
          img.src = "sample-receipt.jpg"*/

          console.debug(`Loading ${trn.noteBlob.name}...`)

          // For the moment we can't support edits, because we need to activate cors first (see further)
          getObjectURI(`users/${uid}/trns/${id}/${trn.noteBlob.name}`).then((uri) => {
            formattedTrn.noteUri = uri

            // NAD: This needs cors to work properly (see: https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
            /*const xhr = new XMLHttpRequest();

            xhr.responseType = 'blob';
            xhr.onload = (event) => {
              const blob = xhr.response;
              formattedTrn.noteBlob = blob
            };

            xhr.open('GET', uri);
            xhr.send();*/
          })
          
          // NAD: This needs cors to work properly (see: https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
          //getObject(`users/${uid}/trns/${id}/${trn.noteBlob.name}`).then((blob) => formattedTrn.noteBlob = blob)
        }

        return formattedTrn
      }

      if (trn.type === 2) {
        const expenseWalletId = trn.expenseWalletId || trn.walletFromId
        const expenseWallet = wallets.items[expenseWalletId]
        if (!expenseWallet)
          return 'Transfer expense Wallet not found'

        const incomeWalletId = trn.incomeWalletId || trn.walletToId
        const incomeWallet = wallets.items[incomeWalletId]
        if (!incomeWallet)
          return 'Transfer income Wallet not found'

        return {
          id,
          ...trn,
          dateFormatted,
          category,
          categoryParent,
          expenseWallet,
          incomeWallet,
        }
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  return {
    formatTrnItem,
    formatDate,
  }
}
