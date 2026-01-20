import { onRequest } from 'firebase-functions/v2/https'
import { defineString, defineSecret, databaseURL } from 'firebase-functions/params';
import { onInit, setGlobalOptions } from 'firebase-functions/v2'
import { logger } from 'firebase-functions/logger'
import cors from 'cors'
// FIXME: Initialize firebase client SDK, not admin SDK, and verify tokens
import admin from 'firebase-admin'
import express from 'express'
import { AzureOpenAI } from 'openai'

// Initialize Firebase Admin SDK
const fb = admin.initializeApp({
    //credential: applicationDefault(), // see env:GOOGLE_APPLICATION_CREDENTIALS for location of private key
    databaseURL: databaseURL.value()
})

const db = admin.database(fb)

setGlobalOptions({
    region: 'europe-west1', // Belgium
});

const azureEndpoint = defineString('AZURE_OPENAI_ENDPOINT');
const azureApiKey = defineSecret('AZURE_OPENAI_API_KEY');
const azureApiVersion = defineString('AZURE_OPENAI_API_VERSION');
const azureModelName = defineString('AZURE_OPENAI_MODEL_NAME');

// Azure OpenAI Configuration
interface AzureOpenAIConfig {
    endpoint: string
    apiKey: string
    apiVersion: string
    modelName: string
}

const azureConfig: AzureOpenAIConfig = {
    endpoint: '',
    apiKey: '',
    apiVersion: '2024-10-01-preview',
    modelName: ''
}

let openai: AzureOpenAI;

onInit(async () => {
    azureConfig.endpoint = azureEndpoint.value();
    azureConfig.apiKey = azureApiKey.value();
    azureConfig.apiVersion = azureApiVersion.value();
    azureConfig.modelName = azureModelName.value();
    logger.info('Azure OpenAI configuration loaded', { modelName: azureConfig.modelName });

    openai = new AzureOpenAI({
        endpoint: azureConfig.endpoint,
        apiKey: azureConfig.apiKey,
        apiVersion: azureConfig.apiVersion
    })
});

interface Trn {
    categoryId: string
    currency: string
    date: Date
    desc: string
    created: Date
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

// Initialize Express app
const app = express()

// Automatically allow cross-origin requests
app.use(cors({ origin: true }))

// Parse request body as JSON
app.use(express.json())

app.get("/yadead", (_, res) => {
    res.status(200).send("No, I'm not dead mon! But thanks for asking.")
})

// Authentication middleware
app.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).send({ error: 'Unauthorized: Missing or invalid Authorization header' });
        return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await fb.auth().verifyIdToken(idToken);
        (req as any).user = decodedToken; // Attach decoded token to request object
        next();
    } catch (error) {
        logger.error('Error verifying ID token:', error);
        res.status(401).send({ error: 'Unauthorized: Invalid token' });
    }
})

// Build multiple CRUD interfaces
//functions.logger.info("Hello logs!", {structuredData: true})
//request.query.foo	 (== ?foo=...)
app.get('/users/:uid/trns/', async (req, res) => {
    try {
        const uid = req.params.uid;
        if (uid !== (req as any).user.uid) {
            throw new Error('Unauthorized access to transactions')
        }
        const response = await Trns.get(req.params.uid, req.query as TrnGetOptions)
        res.send(response)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).send({ status: 'ERROR', message: error.message })
        } else {
            res.status(500).send({ status: 'ERROR', message: 'Unknown error' })
        }
    }
})

//app.post('/', (req, res) => res.send(Widgets.create()))
//app.put('/:id', (req, res) => res.send(Widgets.update(req.params.id, req.body)))
//app.delete('/:id', (req, res) => res.send(Widgets.delete(req.params.id)))
app.get('/users/:uid/categories/', async (req, res) => {
    try {
        const uid = req.params.uid;
        if (uid !== (req as any).user.uid) {
            throw new Error('Unauthorized access to categories')
        }
        const response = await Categories.get(req.params.uid/*, req.query*/)
        res.send(response)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).send({ status: 'ERROR', message: error.message })
        } else {
            res.status(500).send({ status: 'ERROR', message: 'Unknown error' })
        }
    }
})

// Azure OpenAI responses endpoint
app.post('/responses', async (req, res) => {
    if (!openai) {
        res.status(503).send({ error: 'Azure OpenAI service not initialized' })
        return
    }
    try {
        const { content, schema } = req.body.data;

        if (!content || !schema) {
            res.status(400).send({ error: 'Missing required fields: content, schema' })
            return
        }

        const response = await openai.responses.create({
            // FIXME: Change to background task ?
            // background: true,
            instructions: 'You are a helpful assistant.',
            input: [
                {
                    type: 'message',
                    role: 'user',
                    content: [...content]
                }
            ],
            model: azureConfig.modelName,
            // max_output_tokens: 150,
            // temperature: 1.0,
            // top_p: 0.1,
            // reasoning: {
            //     effort: 'low',
            //     summary: 'auto',
            // },
            text: {
                format: {
                    name: 'json_response',
                    schema,
                    type: 'json_schema',
                }
            }
        })

        res.status(200).json({ data: JSON.parse(response.output_text) })
    } catch (error) {
        logger.error('Error calling Azure OpenAI:', error)
        res.status(500).send({ error: 'Internal server error' })
    }
})

// Expose Express API as a single Cloud Function (called "api" in Firebase console)
export const api = onRequest(
    {
        cors: true,
        timeoutSeconds: 60,
        // cpu: 1,
        // memory: '256MiB',
    },
    app
)
