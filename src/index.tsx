import { Button, FrameContext, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { neynar } from 'frog/hubs'
import { NeynarAPIClient } from '@neynar/nodejs-sdk'
import 'dotenv/config'
import { Name } from './Name.js'
import { Address } from './Address.js'
import { PfP } from './PfP.js'
import { Finalize } from './Finalize.js'

const neynarKey = (
  process.env.NEYNAR_API_KEY
  ?? (() => { throw new Error('`$NEYNAR_API_KEY` not set.') })()
)

const getUser = async (ctx: FrameContext) => {
  const neynar = new NeynarAPIClient(neynarKey)
  const { frameData } = ctx
  const {
    fid: userFId = null,
    castId: { fid: viewerFId = null } = {}
  } = frameData ?? {}
  if(!viewerFId || !userFId) return null
  const { users: [user] } = (
    await neynar.fetchBulkUsers(
      [userFId], { viewerFid: viewerFId }
    )
  )
  return user
}

const noUserResponseConfig = {
  image: (
    <p style={{ color: 'red' }}>
      Error: Missing <code>viewerFId</code> or <code>userFId</code>.
    </p>
  ),
  intents: [
    <Button.Reset>Start Over</Button.Reset>,
  ],
}

export const app = new Frog({
  verify: false,
  secret: (
    process.env.FROG_SECRET
    ?? (() => { throw new Error('`$FROG_SECRET` not set.') })()
  ),
  hub: neynar({ apiKey: neynarKey }),
  initialState: {},
})

app.frame('/', (ctx) => (
  ctx.res({
    image: (
      'https://bafybeido6bybdho7tx3klzzycxvbi2qbmcs2zxz7snjhoi3bmbw5eej3ga.ipfs.w3s.link/Join%20MetaGame%3F.png'
    ),
    intents: [
      <Button action="/01-name">¡𝖲𝗂𝗀𝗇 𝖬𝖾 𝖴𝗉!</Button>,
      <Button.Link href="https://enter.metagame.wtf">¿WTF’s 𝐌𝐞𝐭𝐚𝐆𝐚𝐦𝐞?</Button.Link>,
    ]
  })
))

app.frame('/01-name', async (ctx) => {
  console.debug({ c: JSON.stringify(ctx, null, 2) })
  const user = await getUser(ctx)
  if(!user) return ctx.res(noUserResponseConfig)

  const {
    display_name: name,
  } = user ?? {}
  return ctx.res({
    action: '/02-address',
    image: <Name {...{ name }}/>,
    intents: [
      <TextInput placeholder="I’m…"/>,
      <Button value={name}>You Got It</Button>,
      <Button>Use the Typed Value</Button>,
    ],
  })
})

app.frame('/02-address', async (ctx) => {
  const user = await getUser(ctx)
  const { deriveState } = ctx
  if(!user) return ctx.res(noUserResponseConfig)

  deriveState((state: { name: string }) => {
    state.name = ctx.buttonValue || ctx.inputText
  })

  const {
    verified_addresses: { eth_addresses: addresses = [] } = {}
  } = user ?? {}
  return ctx.res({
    action: '/03-image',
    image: <Address/>,
    intents: (
      (addresses.length > 4 || addresses.length === 0) ? [
        <TextInput placeholder="My address is…"/>,
      ] : [
        ...addresses.map((addr) => {
          const short = `${addr.slice(0, 6)}…${addr.slice(-5)}`
          return <Button value={addr}>{short}</Button>
        }),
        <TextInput placeholder="My address is…"/>,
        <Button>Use the Typed Value</Button>,
      ]
    ),
  })
})

app.frame('/03-image', async (ctx) => {
  const user = await getUser(ctx)
  const { deriveState } = ctx
  if(!user) return ctx.res(noUserResponseConfig)

  deriveState((state: { address: string }) => {
    state.address = ctx.buttonValue || ctx.inputText
  })

  const { pfp_url: url } = user ?? {}
  return ctx.res({
    action: '/04-finish',
    image: <PfP {...{ url }}/>,
    intents: [
      <TextInput placeholder="My PfP URL is…"/>,
      <Button value={url}>That’s Good</Button>,
      <Button>Use the Typed Value</Button>,
    ],
  })
})

app.frame('/04-finish', async (ctx) => {
  return ctx.res({
    image: <Finalize/>,
    intents: [
      <Button.Redirect location="https://meta-links.vercel.app">Save To Ceramic</Button.Redirect>,
    ],
  })
})

devtools(app, { serveStatic })