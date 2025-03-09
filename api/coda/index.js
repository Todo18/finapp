//
// I JUST REALIZED THAT THIS CAN ALL HAPPEN CLIENT SIDE, WITH AN ACTIVE, AUTHENTICATED FIREBASE CONNECTION
// So move this from server-side API to client-side "service" ?
//
import { processFile, loadSettings, stop } from '../../../finapp-coda/worker.mjs'
import { db } from '~/services/firebase/api'

const { $store } = useNuxtApp()

async function process(filename, options) {
  // FIXME: Call only once during startup of server ?
  const uid = $store.state.user.user.uid;

  await loadSettings(db, uid);
  await processFile(filename, options);
  // FIXME: Don't call this in server mode
  // await stop();
}

export default function (req, res, next) {
  const contentDisposition = req.headers['content-disposition']
  const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
  const fileName = fileNameMatch ? fileNameMatch[1] : 'unknown'

  let fileContents = ''

  // res is the Node.js http response object
  // Get the data as utf8 strings.
  // If an encoding is not set, Buffer objects will be received.
  req.setEncoding('utf8')

  // Readable streams emit 'data' events once a listener is added.
  req.on('data', chunk => fileContents += chunk)

  // The 'end' event indicates that the entire body has been received.
  req.on('end', async () => {
    try {
      const result = await process(fileName, { contents: fileContents })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        description: `Hello, ${fileName}!`,
      }))
    }
    catch (er) {
      console.error(er)
      // uh oh! bad json!
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        description: 'Fatal Error!',
      }))
    }
  })
}
