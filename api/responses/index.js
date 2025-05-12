import { config } from './config';
import { AzureOpenAI } from 'openai';

// import { initializeApp } from 'firebase/app'
// import { getAuth, signInWithCustomToken } from 'firebase/auth'
// import { config as fb_config } from '~/services/firebase/config'

// export const app = initializeApp(fb_config)
// export const auth = getAuth(app)

const openai = new AzureOpenAI({
  endpoint: config.endpoint,
  apiKey: config.apiKey,
  apiVersion: config.apiVersion
});

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on('data', chunk => {
      data += chunk.toString();
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', error => {
      reject(error);
    });
  });
}

export default async function queryOpenAIModel(req, res, _) {
  try {
    // FIXME: This is incomplete (see client side)
    // const userCredential = await signInWithCustomToken(auth, req.headers['Token']);
    // const user = userCredential.user;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error('Error signing in:', errorCode, errorMessage);
    res.writeHead(401);
    res.end();
  }

  const body = await readBody(req);
  const { prompt, content, schema } = JSON.parse(body);

  try {
    // In preview: https://platform.openai.com/docs/api-reference/responses (not yet available in Azrue OpenAI)
    // const response = await openai.responses.create({
    //   input: {
    //     messages: [
    //       {
    //         role: 'system',
    //         content: 'You are a helpful assistant.'
    //       },
    //       {
    //         role: 'user',
    //         content: prompt
    //       },
    //       {
    //         role: 'user',
    //         content: content
    //       }
    //     ]
    //   },
    //   model: config.modelName,
    //   max_output_tokens: 150,
    //   temperature: 0.2,
    //   // top_p: 1,
    //   text: {
    //     format: {
    //       type: 'json_schema',
    //       schema: schema,
    //       strict: true
    //     },
    //   }
    // });
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: prompt
        },
        {
          role: 'user',
          content: content
        }
      ],
      model: config.modelName,
      max_completion_tokens: 150,
      n: 1,
      // seed: 42,
      store: false,
      stream: false,
      temperature: 0.2,
      // top_p: 1,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          schema,
          // strict: true
        }
      },
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    // res.end(response.output_text);
    res.end(response.choices[0].message.content);
  } catch (error) {
    res.writeHead(500);
    res.end();
  }
}