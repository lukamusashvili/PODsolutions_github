import React from "react";
import {
  Heading,
  DisplayText,
  Stack,
  Button,
  Subheading,
} from "@shopify/polaris";

import { BadgeCustom as Badge } from "./Badge.jsx";

import { useLocation } from "react-router-dom";
import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";

function Header({ name, badge, redirectInfo, shopStatus }) {
  let location = useLocation();
  const config = {
    apiKey: "341e15139cc5c6d65eb5b8027b80908b",
    host: new URLSearchParams(location.search).get("host"),
    forceRedirect: true,
  };

  const app = createApp(config);
  const redirect = Redirect.create(app);

  function redirectToPod() {
    redirect.dispatch(Redirect.Action.REMOTE, {
      url: "https://podsolutions.de/",
      newContext: true,
    });
  }

  return (
    <div className="header">
      <Stack alignment="center">
        <DisplayText size="extraLarge">{name}</DisplayText>
        {badge && <Badge shopStatus={shopStatus} />}
      </Stack>

      {redirectInfo && (
        <div className="redirect-to-website">
          <p className="subheading">Manage your orders now on PODsolution</p>
          <Button primary onClick={redirectToPod}>
            Podsolutions.de
          </Button>
        </div>
      )}
    </div>
  );
}

export default Header;
