// import { processFile } from 'file:///C:/Users/robeyto/Projecten/CoinTracker/coda/daemon.mjs'

export default function (req, res, next) {
  // req is the Node.js http request object
  console.log(req.url)

  let fileContents = ''
  const fileName = /* new URL(req.url, 'http://localhost/').searchParams.get('fileName') ?? */req.headers.contentName

  // res is the Node.js http response object
  // Get the data as utf8 strings.
  // If an encoding is not set, Buffer objects will be received.
  req.setEncoding('utf8')

  // Readable streams emit 'data' events once a listener is added.
  req.on('data', chunk => fileContents += chunk)

  // The 'end' event indicates that the entire body has been received.
  req.on('end', () => {
    try {
      // const result = processFile(fileName, { contents: fileContents })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        description: `Hello, ${fileName}!`,
      }))
    }
    catch (er) {
      // uh oh! bad json!
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        description: 'Fatal Error!',
      }))
    }
  })
}
