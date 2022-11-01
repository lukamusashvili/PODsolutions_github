import React from "react";
import createApp from "@shopify/app-bridge";

import {Text, Stack,  Page, Card} from '@shopify/polaris';

import { Redirect } from "@shopify/app-bridge/actions";
export default function policy() {
  const config = {
    apiKey: "941b92d8ced83eb453f32d0f13e45885",
    host: new URLSearchParams(location.search).get("host"),
    forceRedirect: true,
  };

  const app = createApp(config);
  const redirect = Redirect.create(app);
  return (
    <Page fullWidth>
       
      <Text variant="heading3xl" as="h2">
        Your privacy is important to us.
      </Text>

      <Text variant="bodyLg" as="p">
        It is DigitalGoodiesArts Apps’ policy to respect your privacy regarding
        any information we may collect from you across our apps, and other sites
        we own and operate. We only ask for personal information when we truly
        need it to provide a service to you.
      </Text>
      <Text variant="bodyLg" as="p">
        We collect it by fair and lawful means, with your knowledge and consent.
        We also let you know why we’re collecting it and how it will be used. We
        only retain collected information for as long as necessary to provide
        you with your requested service. What data we store, we’ll protect
        within commercially acceptable means to prevent loss and theft, as well
        as unauthorized access, disclosure, copying, use or modification.
      </Text>
      <Text variant="bodyLg" as="p">
        We don’t share any personally identifying information publicly or with
        third-parties, except when required to by law. You are free to refuse
        our request for your personal information, with the understanding that
        we may be unable to provide you with some of your desired services. Your
        continued use of our apps will be regarded as acceptance of our
        practices around privacy and personal information. If you have any
        questions about how we handle user data and personal information, feel
        free to contact us. This policy is effective as of 1 August 2021.
      </Text> 
  
      
    </Page>
  );
}
