import dayjs from 'dayjs'
import type { Transaction, Transfer, Receipt } from '~/components/trns/types'
import type { TrnFormValues } from '~/components/trnForm/types'
//import {v4 as uuidv4} from 'uuid'
import { generateId } from '~/utils/generateId'

function blobToReceipt(blob: Blob): Receipt {
  const receiptUid: string = /*uuidv4()*/generateId()
  return { uid: receiptUid, url: '(...)'/*URL.createObjectURL(props.receipt)*/ }
}
  
function formatTransaction(props: TrnFormValues): Transaction | false {
  if (props.trnType === 2 || !props.categoryId || !props.walletId) {
    console.error('missing props', props.trnType, props.categoryId, props.walletId)
    return false
  }

  const data: Transaction = {
    amount: props.amount[0],
    type: props.trnType,

    categoryId: props.categoryId,
    walletId: props.walletId,

    date: props.date || dayjs().startOf('date').valueOf(), // NAD: erase time part
    edited: dayjs().valueOf(),
  }

  if (props.desc)
    data.desc = props.desc

  if (props.labels)
    data.labels = props.labels

  if (props.receipt) 
    data.receipt = blobToReceipt(props.receipt)

  return data
}

function formatTransfer(props: TrnFormValues): Transfer | false {
  if (props.trnType !== 2 || !props.expenseWalletId || !props.incomeWalletId) {
    console.error('missing props', props.trnType, props.expenseWalletId, props.incomeWalletId)
    return false
  }

  const data: Transfer = {
    type: props.trnType,
    categoryId: 'transfer' as const,

    date: props.date || dayjs().startOf('date').valueOf(), // NAD: erase time part,
    edited: dayjs().valueOf(),

    expenseAmount: props.amount[1],
    expenseWalletId: props.expenseWalletId,

    incomeAmount: props.amount[2],
    incomeWalletId: props.incomeWalletId,
  }

  if (props.desc)
    data.desc = props.desc

  if (props.labels)
    data.labels = props.labels

  if (props.receipt)
    data.receipt = blobToReceipt(props.receipt)
  
  return data
}

export {
  formatTransaction,
  formatTransfer,
}
