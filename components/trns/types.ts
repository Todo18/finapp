import type { WalletID } from '~/components/wallets/types'

export type TrnID = string
export type CategoryID = string

export enum TrnType {
  Expense,
  Income,
  Transfer,
}

// TODO: make WalletId optional only if TrnType.Transfer
export interface TrnTransaction {
  amount: number
  type: TrnType.Income | TrnType.Expense
  categoryId: CategoryID
  walletId: WalletID
  date: number
}

export interface TrnTransfer {
  type: TrnType.Transfer
  date: number
  categoryId: 'transfer'

  incomeWalletId: WalletID
  incomeAmount: number

  expenseWalletId: WalletID
  expenseAmount: number
}

export type TrnItem = TrnTransaction | TrnTransfer