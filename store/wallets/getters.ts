import { getTrnsIds } from '~/components/trns/getTrns'
import { getTotal, getAmountInRate } from '~/components/amount/getTotal'
import type { WalletId } from '~~/components/wallets/types'

export default {
  hasWallets(_state, _getters, rootState) {
    if (Object.keys(rootState.wallets.items).length > 0)
      return true
  },

  /**
   * Get total in every wallet
   */
  walletsTotal(_state, getters, rootState) {
    if (!getters.hasWallets)
      return {}

    const walletsItems = rootState.wallets.items
    const trnsItems = rootState.trns.items
    const baseCurrencyCode = rootState.currencies.base
    const rates = rootState.currencies.rates

    const getWalletTotal = (walletId: WalletId) => {
      const trnsIds = getTrnsIds({ trnsItems, walletsIds: [walletId] })
      const { sumTransactions, sumTransfers } = getTotal({
        trnsIds,
        trnsItems,
        walletsIds: [walletId],
        walletsItems,
      })

      const wallet = walletsItems[walletId];
      const openingBalance = getAmountInRate({
        amount: wallet.openingBalance ?? 0,
        baseCurrencyCode,
        currencyCode: wallet.currency,
        rates
      })
      return openingBalance + sumTransactions + sumTransfers
    }

    const walletsTotal = {}
    Object.keys(walletsItems)
      .forEach((walletId: WalletId) =>
        walletsTotal[walletId] = getWalletTotal(walletId))

    return walletsTotal
  },

  walletsSortedIds(state, getters) {
    if (!getters.hasWallets)
      return []

    return Object.keys(state.items).sort((a, b) => state.items[a].order - state.items[b].order)
  },
}
