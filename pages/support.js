import React, { useState } from "react";
import createApp from '@shopify/app-bridge';
import {Redirect} from '@shopify/app-bridge/actions';
import { Page, Subheading } from "@shopify/polaris";
import Header from "../components/Header";
import CopyIcon from "../public/Vector.svg";
import { CopyToClipboard } from "react-copy-to-clipboard";

function support() {
  const [email, setemail] = useState("DGA@Gmail.com");
  const config = {
    apiKey: '341e15139cc5c6d65eb5b8027b80908b',
    host: new URLSearchParams(location.search).get("host"),
    forceRedirect: true
  };
  
  const app = createApp(config);
  const redirect = Redirect.create(app);

  return (
    <div className="support">
      <Page fullWidth>
        <Header name={"Support"} />
        <p style={{ margin: "30px 0", fontWeight: 500 }}>
          If you have any questions, issues or <br /> ideas our team is always
          happy to <br /> hear from you!
        </p>
        <p> Contact us </p>

        <div className="contact-div popover">
          {email}
          <CopyToClipboard
            text={"DGA@Gmail.com"}
            onCopy={() => setemail("DGA@Gmail.com")}
          >
            <img src="/Vector.svg" alt="copy" style={{ cursor: "pointer" }} />
          </CopyToClipboard>
        </div>
        <p style={{ fontWeight: 500, cursor: "pointer" }} onClick={() => redirect.dispatch(Redirect.Action.APP, '/policy')}>PRIVACY & COOKIE POLICY</p>
      </Page>
    </div>
  );
}

export default support;
