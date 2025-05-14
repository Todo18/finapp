import type { WalletId } from '~/components/wallets/types'

export type TrnId = string
export type CategoryId = string

export interface Receipt {
  uid: string
  url: string
  // size: number
  // type: string
  // name: string
}

export enum TrnType {
  Expense,
  Income,
  Transfer,
}

export enum TransferType {
  Expense,
  Income,
}

export enum TrnTypeSlug {
  Expense = 'expense',
  Income = 'income',
  Transfer = 'transfer',
}

interface BaseTrn {
  date: number
  desc?: string
  edited: number
  labels?: string[]
  receipt?: Receipt
}

export interface Transaction extends BaseTrn {
  type: TrnType.Income | TrnType.Expense
  amount: number
  categoryId: CategoryId
  walletId: WalletId
}

export interface Transfer extends BaseTrn {
  type: TrnType.Transfer
  categoryId: 'transfer'

  incomeWalletId: WalletId
  incomeAmount: number

  expenseWalletId: WalletId
  expenseAmount: number
}

/** @deprecated: use Transfer */
export interface TransferDeprecated {
  type: TrnType.Transfer
  date: number
  edited: number
  categoryId: 'transfer'

  amountFrom: number
  walletFromId: WalletId

  amountTo: number
  walletToId: WalletId
}

export type TrnItem = Transaction | Transfer
export type TrnItemDirty = Transaction | Transfer | TransferDeprecated

export type Trns = Record<TrnId, TrnItem>
export type TrnsDirty = Record<TrnId, TrnItemDirty>
