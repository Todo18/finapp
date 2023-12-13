import * as functions from 'firebase-functions'
import express, { Express } from 'express'
import cors from 'cors'
import admin from 'firebase-admin'

// NOTE: Can't automatically infer type(s) because of namespace having same name as top-level function
const app: Express = express()

// Automatically allow cross-origin requests
app.use(cors({ origin: true }))

// Add middleware to authenticate requests
//app.use(myMiddleware)

admin.initializeApp({
    //credential: applicationDefault(), // see env:GOOGLE_APPLICATION_CREDENTIALS for location of private key
    databaseURL: "https://coin-tracker-802c7.firebaseio.com"
})

const db = admin.database()

interface Trn {
    categoryId: string
    currency: string
    date: Date
    description: string
    edited: Date
    type: number
}

interface Category {
    name: string
    parentId: string
}

/*interface NonTransferTrn extends Trn {
    amount: number
    walletId: string
}

interface TransferTrn extends Trn {
    expenseAmount: number
    expenseWalletId: string
    incomeAmount: number
    incomeWalletId: string
}*/

interface ApiResponse {
    status: string,
    data: any
}

interface TrnGetOptions {
    type?: number
}

class Trns {
    static async get(uid: string, options: TrnGetOptions): Promise<ApiResponse> {
        const path = `users/${uid}/trns`
        const trns = await db.ref(path).orderByChild('date').once('value', (snapshot) => {
            const val: Array<[string, any]> = Object.entries(snapshot.val()).filter(
                (v: [string, any]): boolean => !options.type || (options.type === v[1].type))
            const trns: Map<string, Trn> = new Map<string, Trn>(val)
            return trns
        })

        return { status: 'OK', data: trns }
    }
}

class Categories {
    static async get(uid: string/*, options: CategoryGetOptions*/): Promise<ApiResponse> {
        const path = `users/${uid}/categories`
        const cats = await db.ref(path).once('value', (snapshot) => {
            const val: Array<[string, any]> = Object.entries(snapshot.val())/*.filter(
                (v: [string, any]): boolean => true)*/
            const cats: Map<string, Category> = new Map<string, Category>(val)
            return cats
        })

        return { status: 'OK', data: cats }
    }
}

// Build multiple CRUD interfaces
//functions.logger.info("Hello logs!", {structuredData: true})
//request.query.foo	 (== ?foo=...)
app.get('/users/:uid/trns/', async (req, res) => res.send(await Trns.get(req.params.uid, req.query)))
//app.post('/', (req, res) => res.send(Widgets.create()))
//app.put('/:id', (req, res) => res.send(Widgets.update(req.params.id, req.body)))
//app.delete('/:id', (req, res) => res.send(Widgets.delete(req.params.id)))
app.get('/users/:uid/categories/', async (req, res) => res.send(await Categories.get(req.params.uid/*, req.query*/)))

// Expose Express API as a single Cloud Function
// NOTE: export const api = functions... will _not_ work :/
export const api = functions
    .region('europe-west1') // Belgium
    .https.onRequest(app)
