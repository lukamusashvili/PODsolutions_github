import React, { Component, useEffect, useState } from "react";
import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import App from "./App";


function Index() {
  const [renderUI, setRenderUI] = useState(false)

  useEffect(() => {
    setRenderUI(true)
  }, [])
 
  if(renderUI) {
    return (
      <AppProvider i18n={enTranslations}>
        <App />
      </AppProvider>
    )
  } else {
    return null
  }
}

export default Index
