import React, {useEffect, useState} from "react";
import {Page, Layout} from "@shopify/polaris";
import Header from '../components/Header.jsx'
import PolarisTable from '../components/PolarisTable'


export default function App() {
  const [tableData, setTableData] = useState([])
  const [shopStatus, setShopStatus] = useState("")
  let shopName = window.location.ancestorOrigins[0]
  shopName = shopName.slice(8, shopName.length)
  shopName = shopName.slice(0,13)

  useEffect(() => {
    const  a = window.location.ancestorOrigins[0]
    const shop = a.slice(8, a.length)
    const URL = "https://shop.podsolutions.de"
  
    var myHeaders = new Headers();
    myHeaders.append("user", "myvalentine");
    myHeaders.append("pass", "$2y$12$FAzIRc0F1zWAsrsCt3c2Sexs2x7Hd6bpag6su5swjKtysteM5gtOu");
    myHeaders.append("Content-Type", "application/json");


    var raw = JSON.stringify({
      "shop": shop
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(URL + "/orders", requestOptions)
    .then(response => response.text())
    .then(result => setTableData(JSON.parse(result)))
    .catch(error => console.log('error', error));

    fetch(URL + "/checkshopstatus", requestOptions)
    .then(response => response.text())
    .then(result => setShopStatus(result))
    .catch(error => console.log('error', error));
  
  
  
  
  
  }, [])
  
  return (
    <div>
       <Page fullWidth>
        {/* <TitleBar title="Project X" primaryAction={null} /> */}
        <Layout>
          <Layout.Section>
            <Header name={`${shopName} shop`} shopStatus={shopStatus} badge={true} redirectInfo={true}/>
          </Layout.Section>
          <Layout.Section>
            <PolarisTable tableData = {tableData}/>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
   
  );
}