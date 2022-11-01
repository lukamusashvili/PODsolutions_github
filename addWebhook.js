const { default: Shopify } = require('@shopify/shopify-api');

const addWebhook = async (shop, accessToken, topic, callbackUrl) => {
  const query = `mutation {
    webhookSubscriptionCreate(
      topic: ${topic},
      webhookSubscription: {
          callbackUrl: "${callbackUrl}",
          format: JSON
      }
    )
    {
        webhookSubscription {
            id
          }
          userErrors {
            field
            message
          }
        
    }
  }`;

    const client = new Shopify.Clients.Graphql(shop, accessToken);
    
    const response = await client.query({
    data: query,
    });
    if(topic == "ORDERS_PAID"){
      try {
        console.log("body.errors", response.body.errors);
        const id = response.body.data.webhookSubscriptionCreate.webhookSubscription.id.split("/").pop()
        console.log("body data", id);
        return id;
      }
      catch (err ) {
          console.log("err", err)
      }
    }else{
      try {
        console.log("body.errors", response.body.errors);
      }
      catch (err ) {
          console.log("err", err)
      }
    }

    
    return 0;
  
};

module.exports = {
    addWebhook
}