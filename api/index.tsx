import { Button, Frog } from "frog";
import "dotenv/config";
import { neynar } from "frog/hubs";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  browserLocation: "/",
  secret: process.env.SECRET,
  initialState: {
    class: "",
    drinkCount: 0,
    name: "",
    receivingAddress: "",
    receivingAddressIndex: 0,
  },
  verify: "silent",
  hub: neynar({ apiKey: process.env.NEYNAR_API_KEY }),
});


const defaultContainer = (children: JSX.Element) => (
  <div
    style={{
      alignItems: "center",
      background: "black",
      backgroundSize: "100% 100%",
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      height: "100%",
      justifyContent: "center",
      textAlign: "center",
      width: "100%",
    }}
  >
    {children}
  </div>
);


app.frame("/", (c) => {
  return c.res({
    title: "Join MetaGame",
    image: defaultContainer(
      <div
        style={{
          alignItems: "center",
          border: "6px solid #ff3864",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          height: "60%",
          width: "90%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 38,
            fontStyle: "normal",
            fontFamily: "Times",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            padding: "0 80px",
            whiteSpace: "pre-wrap",
          }}
        >
          Create a profile and join 
        </div>
      </div>
    ),
    intents: [
      <Button action="/1">Create Profile</Button>,
    ],
  });
});

app.frame("/1", async (c) => {
  const { deriveState, buttonValue, frameData } = c;
  const { fid } = frameData;
  const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
  const res = await neynarClient.fetchBulkUsers([fid]);
  const address = res.users[0].verified_addresses[0].address;
  return c.res({
    title: "Create Profile",
    image: defaultContainer(
      <div
        style={{
          alignItems: "center",
          border: "6px solid #ff3864",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          height: "60%",
          width: "90%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 38,
            fontStyle: "normal",
            fontFamily: "Times",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            padding: "0 80px",
            whiteSpace: "pre-wrap",
          }}
        >
          Create a profile and join, {address}
        </div>
      </div>
    ),
    intents: [
      <Button action="/2">Customise Profile</Button>,
    ],
  })
})