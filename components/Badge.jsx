import React from 'react'
import {Badge, Spinner} from '@shopify/polaris';


export const BadgeCustom =  function ({shopStatus}) {
  React.useEffect(() => {
    console.log(shopStatus, "shopstatus")
  }, [])
  
  return (
    <div>
        <Badge status={shopStatus === "active" ? "success" : shopStatus === "inactive" ? "inactive" : "undefined" }>
          {shopStatus === "active" ? "Active" : shopStatus === "inactive" ? "inactive": "loading"}
        </Badge>
    </div>
    
  )
}
