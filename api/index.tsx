import { Button, FrameContext, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { neynar } from 'frog/hubs'
import { NeynarAPIClient } from '@neynar/nodejs-sdk'
import 'dotenv/config'
import { handle } from 'frog/vercel'

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

export const Address = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '35pt',
      lineHeight: '7',
      width: '100%',
      height: '100%',
    }}>
      <p>What's your</p>
      <p>Ethereum</p>
      <p>address?</p>
    </div>
  )
}

export const Finalize = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '35pt',
      lineHeight: '7',
      width: '100%',
      height: '100%',
    }}>
      <p style={{ color: 'blue' }}>Done with configuration.</p>
      <p style={{ textAlign: 'center', color: 'green' }}>Now, visit MetaGame’s site to write your profile to the Ceramic network.</p>
    </div>
  )
}

export const Name = ({ name }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '35pt',
      lineHeight: '7',
      width: '100%',
      height: '100%',
    }}>
      <p>What’s your name?</p>
      <p>{name}?</p>
    </div>
  
  )
}

export const PfP = ({ url }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '35pt',
      lineHeight: '7',
      width: '100%',
      height: '100%',
    }}>
      <img
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        src={url}
        alt="Profile Picture"
      />
    </div>
  )
}

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  browserLocation: "/",
  verify: false,
  secret: (
    process.env.FROG_SECRET
    ?? (() => { throw new Error('`$FROG_SECRET` not set.') })()
  ),
  initialState: {
    omg: '🐸',
  },
  hub: neynar({ apiKey: neynarKey }),
})
 
app.frame('/', (ctx) => {
  return ctx.res({
    title: 'Join MetaGame?',
    image: (
      'https://bafybeido6bybdho7tx3klzzycxvbi2qbmcs2zxz7snjhoi3bmbw5eej3ga.ipfs.w3s.link/Join%20MetaGame%3F.png'
    ),
    intents: [
      <Button action="/01-name">¡𝖲𝗂𝗀𝗇 𝖬𝖾 𝖴𝗉!</Button>,
      <Button.Link href="https://enter.metagame.wtf">¿WTF’s 𝐌𝐞𝐭𝐚𝐆𝐚𝐦𝐞?</Button.Link>,
    ]
  })
})

app.frame('/01-name', async (ctx) => {
  console.debug({ c: JSON.stringify(ctx, null, 2) })
  const user = await getUser(ctx)
  if(!user) return ctx.res(noUserResponseConfig)

  const {
    display_name: name,
  } = user ?? {}

  return ctx.res({
    action: '/02-address',
    title: 'What’s Your Name?',
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
    title: 'What’s Your Address?',
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
    title: 'What’s Your PfP URL?',
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
    title: 'Finalize Your Profile',
    intents: [
      <Button.Redirect location="https://meta-links.vercel.app">Save To Ceramic</Button.Redirect>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)