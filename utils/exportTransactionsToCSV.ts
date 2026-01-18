import dayjs from 'dayjs'
import type { TrnId, TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~/components/wallets/types'
import type { CategoryItem } from '~/components/categories/types'

interface ExportTransactionsProps {
  trnsIds: TrnId[]
  trnsItems: Record<TrnId, TrnItem>
  walletsItems: Record<string, WalletItem>
  categoriesItems: Record<string, CategoryItem>
}

export function exportTransactionsToCSV({
  trnsIds,
  trnsItems,
  walletsItems,
  categoriesItems,
}: ExportTransactionsProps) {
  // Define CSV headers
  const headers = [
    'Date',
    'Type',
    'Category',
    'Parent Category',
    'Wallet',
    'Amount',
    'Currency',
    'Description',
    'Expense Wallet',
    'Expense Amount',
    'Income Wallet',
    'Income Amount',
  ]

  // Map transaction type to readable text
  const getTrnType = (type: number): string => {
    if (type === 0) return 'Expense'
    if (type === 1) return 'Income'
    if (type === 2) return 'Transfer'
    return 'Unknown'
  }

  // Escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === undefined || value === null) return ''
    const stringValue = String(value)
    // Escape double quotes and wrap in quotes if contains comma, newline, or quote
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  // Build CSV rows
  const rows = trnsIds.map((trnId) => {
    const trn = trnsItems[trnId]
    if (!trn) return null

    const date = dayjs(trn.date).format('YYYY-MM-DD')
    const type = getTrnType(trn.type)
    
    let category = ''
    let parentCategory = ''
    let wallet = ''
    let amount = ''
    let currency = ''
    let expenseWallet = ''
    let expenseAmount = ''
    let incomeWallet = ''
    let incomeAmount = ''

    // Handle regular transactions (Income/Expense)
    if (trn.type !== 2) {
      const walletItem = walletsItems[trn.walletId]
      const categoryItem = categoriesItems[trn.categoryId]
      
      category = categoryItem?.name || trn.categoryId
      
      // Get parent category if it exists (parentId is CategoryId | 0)
      if (categoryItem?.parentId && typeof categoryItem.parentId === 'string') {
        const parentCategoryItem = categoriesItems[categoryItem.parentId]
        parentCategory = parentCategoryItem?.name || ''
      }
      
      wallet = walletItem?.name || trn.walletId
      amount = String(trn.amount)
      currency = walletItem?.currency || ''
    }
    
    // Handle transfers
    if (trn.type === 2) {
      const expenseWalletItem = walletsItems[trn.expenseWalletId]
      const incomeWalletItem = walletsItems[trn.incomeWalletId]
      
      category = 'Transfer'
      expenseWallet = expenseWalletItem?.name || trn.expenseWalletId
      expenseAmount = String(trn.expenseAmount)
      incomeWallet = incomeWalletItem?.name || trn.incomeWalletId
      incomeAmount = String(trn.incomeAmount)
    }

    const description = trn.desc || ''

    return [
      escapeCSV(date),
      escapeCSV(type),
      escapeCSV(category),
      escapeCSV(parentCategory),
      escapeCSV(wallet),
      escapeCSV(amount),
      escapeCSV(currency),
      escapeCSV(description),
      escapeCSV(expenseWallet),
      escapeCSV(expenseAmount),
      escapeCSV(incomeWallet),
      escapeCSV(incomeAmount),
    ].join(',')
  }).filter(Boolean)

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n')

  // Create download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // Generate filename with current date
  const filename = `finapp-transactions-${dayjs().format('YYYY-MM-DD')}.csv`
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
