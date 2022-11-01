import {useEffect, useState} from 'react'
import "../styles/style.css";

import { BrowserRouter, Routes } from "react-router-dom";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

//https://bobbyhadz.com/blog/react-sort-array-of-objects

import Navbar from "../components/Navbar";

export default function MyApp({ Component, pageProps }) {
  const [renderUI, setRenderUI] = useState(false)
  useEffect(() => {
    setRenderUI(true)
  }, [])
  
  if(renderUI) {
     return (
      <BrowserRouter>
        <Navbar />
        <Component {...pageProps} />
      </BrowserRouter>
    );
  } else {
    return null
  }
   
  
}
