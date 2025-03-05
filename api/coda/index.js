import { processFile, loadSettings, stop } from '../../../finapp-coda/worker.mjs'

async function process(filename, options) {
  // FIXME: Call only once during startup of server
  await loadSettings();
  await processFile(filename, options);
  // FIXME: Don't call this in server mode
  await stop();
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
