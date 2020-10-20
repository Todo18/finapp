export default {
  appName: 'Finapp',

  locale: {
    toogle: 'Toogle locale'
  },

  theme: {
    change: 'Change theme'
  },

  trnForm: {
    transferTitle: 'Transfer',
    createTrnButton: 'Create transaction',
    createTransferButton: 'Create transfer',
    titleEditTrn: 'Edit transaction',
    titleCreateTrn: 'Create new transaction',
    filterWalletAndCategory: 'Wallet & Category',
    filterWallet: 'Wallet only',
    filterAll: 'Everything',
    title: 'Transaction form',
    lastUsedCats: 'Show last used categories',
    description: {
      title: 'Description',
      placeholder: 'Write description...'
    }
  },

  app: {
    thanks: 'Trnaks to @TheCarolissy and @TihomirovPro 🚀🤘',
    version: 'Version',
    desc: 'Powerful personal finance application',
    welcome: 'Welcome to Finapp',
    lang: {
      select: 'Select lang',
      en: 'English',
      ru: 'Русский'
    },
    theme: {
      select: 'Select theme',
      dark: 'Dark',
      light: 'Light'
    },
    madeBy: {
      text: 'Made with',
      name: 'by Ilya Komichev'
    }
  },

  userLogout: 'Logout',
  loginWithGoogle: 'Login with Google',
  changeTheme: 'Change theme',
  createTrn: 'Create transaction',

  base: {
    sure: 'Are you sure?',
    yes: 'Yes',
    no: 'No',
    sort: 'Sort',
    save: 'Save',
    cancel: 'Cancel',
    on: 'On',
    off: 'Off',
    edit: 'Edit',
    delete: 'Delete',
    filter: 'Filter'
  },

  welcome: {
    firstRun: {
      text: 'Start with create base configuration of application',
      btn: 'Start'
    },
    create: {
      text: 'Start creating your own wallets, categories',
      btn: 'Create'
    },
    or: 'or',
    demo: {
      text: 'Load app with created wallets, categories and transactions',
      btn: 'Start demo'
    },
    createFirstWallet: {
      text: "Let's start with create first Wallet",
      btn: 'Create wallet'
    },
    createFirstCategory: {
      text: "Great! Now Let's create first category",
      btn: 'Create category'
    }
  },

  settings: {
    title: 'Settings',
    lang: 'Language',
    options: 'Options',
    open: 'Open settings',
    customize: 'Сustomize',
    app: 'Application',
    delete: 'Delete',
    demo: 'Demo',
    deleteButton: 'Delete my data',
    loadDemoButton: 'Load demo data'
  },

  wallets: {
    title: 'Wallets',
    name: 'Wallets',
    new: 'New wallet',
    showAll: 'show all wallets',
    showOnly: 'show only',
    sortTitle: 'Sort wallets',
    createNewTitle: 'Create new wallet',
    editTitle: 'Edit wallet',
    form: {
      name: {
        label: 'Wallet name',
        placeholder: 'Write wallet name...',
        error: 'Write wallet name',
        exist: 'Wallet with same name is exist'
      },
      color: {
        label: 'Color',
        placeholder: 'Select color',
        error: 'Select color',
        custom: 'Custom color'
      },
      currency: {
        label: 'Currency',
        placeholder: 'Select currency',
        error: 'Select currency'
      },
      total: {
        placeholder: 'Count amount in total balance'
      },
      save: 'Save'
    }
  },

  currency: {
    selectBaseTitle: 'Select base currency'
  },

  categories: {
    title: 'Categories',
    name: 'Categories',
    shortTitle: 'Cats',
    new: 'New category',
    allTitle: 'All',
    lastUsedTitle: 'Last used',
    favoriteTitle: 'Favorite categories',
    createNewTitle: 'Create new category',
    editTitle: 'Edit category',
    form: {
      name: {
        label: 'Category name',
        placeholder: 'Write category name...',
        error: 'Write category name',
        exist: 'Category with same name is exist'
      },
      parent: {
        no: 'No parent',
        label: 'Parent category',
        placeholder: 'Select parent category'
      },
      color: {
        label: 'Color',
        placeholder: 'Select color',
        error: 'Select color',
        custom: 'Custom color'
      },
      icon: {
        label: 'Icon',
        placeholder: 'Select icon'
      },
      lastUsed: 'Show in last used categories',
      quickSelector: 'Show in trnForm quick selector',
      childColor: 'Apply color to all child categories',
      save: 'Save'
    }
  },

  stat: {
    shortTitle: 'Stat',
    balanceTitle: 'Balance',
    empty: 'No stat for this period',
    customize: {
      showPeriodsChart: 'Show periods chart',
      showCategorisChart: 'Show categories chart',
      showCategorisList: 'Show categories list'
    }
  },

  chart: {
    title: 'Chart',
    view: {
      add: 'Add',
      remove: 'Remove',
      toogle: 'Toogle chart view',
      showed: 'Showed',
      groupsName: 'groups',
      periodsName: 'periods',
      simpleTitle: 'Simple chart',
      groupedTitle: 'Griuped chart',
      addGroupButton: 'Add group',
      addPeriodButton: 'Add period',
      removeGroupButton: 'Remove group',
      removePeriodButton: 'Remove period'
    }
  },

  trns: {
    shortTitle: 'Trns',
    history: 'History',
    more: 'Show more'
  },

  create: {
    title: 'Create'
  },

  money: {
    incomes: 'Incomes',
    expenses: 'Expenses',
    transfer: 'Transfer',
    total: 'Total',
    average: 'Average',
    also: 'Also',
    wallets: 'Wallets',
    all: 'Total'
  },

  dates: {
    day: {
      current: 'Today',
      today: 'Today',
      yesterday: 'Yesterday',
      simple: 'Day'
    },
    week: {
      current: 'This week',
      simple: 'Week'
    },
    month: {
      current: 'This month',
      simple: 'Month'
    },
    year: {
      current: 'This year',
      simple: 'Year'
    },
    all: 'Show all'
  },

  alerts: {
    willDeleteEverything: 'This will delete all your wallets, categories and trns.'
  },

  buttons: {
    nextTitle: 'Next',
    prevTitle: 'Prev',
    nextStep: 'Next step'
  },

  budgets: {
    id: 'budgets',
    name: 'Budgets',
    form: {
      title: 'Create new budget',
      name: 'Budget name',
      amount: 'Budget amount',
      button: 'Create'
    },
    trns: {
      name: 'Budget transactions'
    },
    stat: {
      left: 'Left',
      got: 'Got',
      total: 'Total'
    }
  },

  groups: {
    id: 'groups',
    name: 'Groups',
    form: {
      title: 'Create new group',
      name: 'Group name',
      amount: 'Group amount',
      button: 'Create'
    },
    trns: {
      name: 'Group transactions'
    },
    stat: {
      expenses: 'Epenses',
      incomes: 'Incomes',
      total: 'Total'
    }
  },

  users: {
    title: 'Users'
  }
}