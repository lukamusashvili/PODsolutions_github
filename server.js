//#region IMPORTING *DONE*
require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const fs = require('fs');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');
const Router = require('koa-router');
const koaBody = require('koa-body');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const cors = require('@koa/cors');
const crypto = require('crypto')
const { addWebhook } = require('./addWebhook');
dotenv.config(); //test

var Production = 0; // 0 - Development; 1 - Production
var hostVar
var appId = process.env.SHOPIFY_API_KEY
if(Production == 1){
  hostVar = process.env.SHOPIFY_APP_URL.replace(/https:\/\//, "")
}else{
  hostVar = process.env.SHOPIFY_APP_URL_LOCAL.replace(/https:\/\//, "")
}

const mongoose = require('mongoose');
const mongoPath = process.env.MongoDBPath;
const db = mongoose.connection;
const dbUpdate = {useNewUrlParser:true,useUnifiedTopology:true};
const shops = require('./model/shops.js');
const orders = require('./model/orders.js');

mongoose.connect(mongoPath, dbUpdate);

db.on('error', (err) => console.log('Error, DB Not Connected'));
db.on('connected', () => console.log('Connected to Mongo'));
db.on('disconnected', (err) => console.log('Mongo is disconnected'));
db.on('open', (err) => console.log('Connection Made!'));
//#endregion
//#region SHOPIFY INITIALIZE *DONE*
Shopify.Context.initialize({
  API_KEY: appId,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SHOPIFY_API_SCOPES.split(","),
  HOST_NAME: hostVar,
  API_VERSION: ApiVersion.January22,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});
//#endregion
//#region SERVER CONFIG *DONE*
const port = process.env.APP_PORT;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
//#endregion
//#region APP CONFIG *DONE*
app.prepare().then(() => {
  const server = new Koa();
  server.use(cors());
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      accessMode: 'offline',
      async afterAuth(ctx) {
	      const {  shop, accessToken  } = ctx.state.shopify;
        addWebhook(shop, accessToken, "APP_UNINSTALLED", `https://${hostVar}/webhooks/app/uninstalled`);
        currentShops = await shops.distinct('shop',{})
        console.log("00 -- "+shop+" -- "+accessToken)
        if (currentShops.includes(shop)) { //addShop
            const shop = await shops.findOne({ shop: shop}, '_id')
            console.log(shop)
            ctx.redirect(`https://${shop}/admin/apps/${appId}/?shop=${shop}&host=${hostVar}`)
        }
        else{
            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            xhr.onreadystatechange = function() {
              if (this.readyState == 4) {
                var response = this.responseText
                var responseObj = JSON.parse(response)

                var data = {
                  shop: shop,
                  ownerName: responseObj.shop.shop_owner,
                  company: responseObj.shop.name,
                  email: responseObj.shop.email,
                  token: accessToken,
                  status: "inactive",
                  webhookID: "none"
                }
                var data2 = {
                  shop: shop,
                  ownerName: responseObj.shop.shop_owner,
                  company: responseObj.shop.name,
                  email: responseObj.shop.email
                }

                insertShop(data)

                // var xhr = new XMLHttpRequest();
                // xhr.withCredentials = true;
                // xhr.onreadystatechange = function() {
                //   if (this.readyState == 4 && this.status == 201) {
                //     console.log(this.status)
                //     insertShop(data)
                //   }         
                //   else if (this.readyState == 4 && this.status !== 201){
                //     console.log(this.status);
                //   }
                // };
                // xhr.open("POST", "https://www.podsolutionshopify.com/api/register-user", true);
                // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
                // xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                // xhr.send(JSON.stringify(data2));
              }
            };
            xhr.open("GET", "https://"+shop+"/admin/api/2022-10/shop.json");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-Shopify-Access-Token", accessToken);
            xhr.send();

            ctx.redirect(`https://${shop}/admin/apps/${appId}/?shop=${shop}&host=${hostVar}`)
        }
      }
    })
  );
//#endregion
//#region ROUTERS
//#region HANDLE *DONE*
  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };
//#endregion
//#region INDEX *DONE*
  router.get("/", async (ctx) => {
    const shop = ctx.query.shop
    console.log(shop)
    currentShops = await shops.distinct('shop',{})
    console.log(currentShops)
    if (currentShops.includes(shop)) { //addShop
      console.log("me")
      await handleRequest(ctx);
    } else {
      console.log("mee")
      ctx.redirect(`/auth?shop=${shop}&host=${hostVar}`);
    }
  });
//#endregion
//#region CHANGE TRACK ID (FULFILL) *DONE*
  router.post('/changetrack', koaBody(), async (ctx, next) => {
    const requestedBody = ctx.request.body
    const orderID = requestedBody.orderID
    const trackID = requestedBody.trackID
    const lineItemsID = requestedBody.lineItemsID
    const shopName = requestedBody.shopName
    const shopToken = await shops.findOne({ shop: shopName}, '-_id token')
    console.log(requestedBody)
    const data =
    {
        fulfillment: {
          line_items: lineItemsID,
          tracking_info: {
            url: "https:\/\/dhlshipping.app\/api\/tracking\/PAKET\/"+trackID,
            number: trackID,
            company: "DHL PAKET"
          },
          "line_items_by_fulfillment_order":
          [
            {
              "fulfillment_order_id":orderID,
              "fulfillment_order_line_items":lineItemsID
            }
          ]
        }
    }
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.onreadystatechange = function() {
      if (this.readyState == 4){
        console.log(this.responseText)
      }
    };
    xhr.open("POST", "https://"+shopName+"/admin/api/2022-10/fulfillments.json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Shopify-Access-Token", shopToken.token);
    xhr.send(JSON.stringify(data));
    ctx.body = "success"
    ctx.error
    await next();
  })
//#endregion
//#region CHANGE SHOP STATUS (WEBHOOK ACTIVATION) *DONE*
router.post('/shopstatus', koaBody(), async (ctx, next) => {
  const requestedBody = ctx.request.body
  const shopName = requestedBody.shopname
  const status = requestedBody.status
  const shopToken = await shops.findOne({ shop: shopName}, '-_id token')
  console.log(shopName,status,shopToken.token)
  if(status=="active"){
    //change status to active
    await shops.updateOne({ shop: shopName }, {$set: {status: "active"}})
    //add webhook
    const webhookID = await addWebhook(shopName, shopToken.token, "ORDERS_PAID", `https://${hostVar}/getorders`);
    await shops.updateOne({ shop: shopName }, {$set: {webhookID: webhookID}})
  } else{
    //change status to inactive
    await shops.updateOne({ shop: shopName }, {$set: {status: "inactive"}})
    //remove webhook
    const webhookID = await shops.findOne({ shop: shopName}, '-_id webhookID')
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.onreadystatechange = async function() {
      if (this.readyState == 4) {
        console.log(this.responseText)
        await shops.updateOne({ shop: shopName }, {$set: {webhookID: "none"}})
      }
    };
    xhr.open("DELETE", "https://"+shopName+"/admin/api/2022-04/webhooks/"+webhookID.webhookID+".json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Shopify-Access-Token", shopToken.token);
    xhr.send();
  }
  ctx.body = requestedBody
  ctx.error
  await next();
})
//#endregion
//#region MANUAL ORDER RECEIVER
router.post('/manualorderreceiver', koaBody(), async (ctx,next) => {
  var requestedBody = ctx.request.body
  var ordersArray = requestedBody
  const endpoint = "/api/recover-order"
  console.log(ordersArray)

  var myVar = setInterval(myTimer, 5000);
  var n = 0

  function myTimer() {
      manualOrderReceiver(ordersArray[n],endpoint)
      console.log(ordersArray[n])
      n += 1
      if(n == ordersArray.length){
        myStopFunction()
      }
  }

  function myStopFunction() {
    clearInterval(myVar);
  }
  ctx.body = "success"
  ctx.error
  await next();
})
//#endregion
//#region MANUAL ORDER RECEIVER2
router.post('/manualorderreceiver2', koaBody(), async (ctx,next) => {
  var requestedBody = ctx.request.body
  var ordersArray = requestedBody
  const endpoint = "/api/get-new-orders"
  console.log(ordersArray)

  var myVar = setInterval(myTimer, 5000);
  var n = 0

  function myTimer() {
      manualOrderReceiver(ordersArray[n],endpoint)
      console.log(ordersArray[n])
      n += 1
      if(n == ordersArray.length){
        myStopFunction()
      }
  }

  function myStopFunction() {
    clearInterval(myVar);
  }
  ctx.body = "success"
  ctx.error
  await next();
})
//#endregion
//#region APP UNINSTALL
router.post('/webhooks/app/uninstalled', koaBody(), async (ctx) => {
  console.log(ctx.request.body)
  const shop =  ctx.request.body.myshopify_domain
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 201) {
      console.log(this.status)
    }         
    else if (this.readyState == 4 && this.status !== 201){
      console.log(this.status);
    }
  };
  xhr.open("POST", "https://www.podsolutionshopify.com/api/remove-user", true);
  xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('user', 'myvalentine');
  xhr.setRequestHeader('pass', '$2y$12$FAzIRc0F1zWAsrsCt3c2Sexs2x7Hd6bpag6su5swjKtysteM5gtOu');
  xhr.send(JSON.stringify(shop));
  deleteShop(shop);
  ctx.res.statusCode = 200;
});
//#endregion
//#region ORDERS PAID WEBHOOK RECEIVER
router.post('/getorders', koaBody(), async (ctx)=> {
  console.log('received webhook: ', ctx.request.body.id);
  var obj = ctx.request.body
  // we need to filter the orders here
  var data = {
    shop: obj.order_status_url.split("/")[2],
    orderId: obj.id,
    orderName: obj.name,
    status: "sending"
  }
  insertOrder(data)
  manualOrderReceiver(obj.order_status_url.split("/")[2],obj.id,"/api/get-new-orders")
  ctx.res.statusCode = 200;
  ctx.body = "ok"
});
//#endregion
//#region GDPR *DONE*
router.post('/customers/data_request', async (ctx, next) => {
  ctx.body = "the app has no customers data"
  await next();
})

router.post('/customers/redact', async (ctx, next) => {
  ctx.body = "the app has no customers data"
  await next();
})  

router.post('/shop/redact', koaBody(), async (ctx) => {
  console.log(ctx.request.body)
  if (verifyWebhookRequest(ctx.request.body, ctx.request.headers["x-shopify-shop-domain"], ctx.request.headers["x-shopify-hmac-sha256"]) === true) {
      ctx.res.statusCode = 200;
  } else {
      ctx.res.statusCode = 401;
  }
})

async function verifyWebhookRequest(data, shop, hmac) {
  try {
      const generateHash = crypto
          .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
          .update(data , "utf-8")
          .digest("base64");
      
      if (generateHash === hmac) {
          deleteShop(shop)
          console.log("Successfully verified Shopify webhook HMAC");
          return true;
      } else {
          return false;
      }
  } catch (error) {
      return false;
  }
}
//#endregion
//#region ORDERS LIST (FOR FRONTEND)
router.post('/orders', koaBody(), async (ctx)=> {
  const shop = ctx.request.body.shop
  const ordersData = await orders.find({ shop: shop}, '-_id orderId orderName createdAt status')
  console.log(ordersData)
  ctx.body = ordersData
});
//#endregion
//#region CHECK SHOP STATUS (FOR FRONTEND)
router.post('/checkshopstatus', koaBody(), async (ctx)=> {
  const shop = ctx.request.body.shop
  const shopsData = await shops.findOne({ shop: shop}, '-_id status')
  ctx.body = shopsData.status
});
//#endregion
//#endregion
//#region FUNCTIONS *DONE*
//#region MANUAL ORDER RETRIEVER *DONE*
async function manualOrderReceiver(shopName,orderId,endpoint) {
  const shopToken = await shops.findOne({ shop: shopName}, '-_id token')
  const token = shopToken.token
  const temp = {"id":3957509390465,"admin_graphql_api_id":"gid://shopify/Order/5244761637132","app_id":580111,"browser_ip":"95.91.229.24","buyer_accepts_marketing":true,"cancel_reason":null,"cancelled_at":null,"cart_token":"36c368d147ee7e7760e6e447e3066f9a","checkout_id":35857107910924,"checkout_token":"16831e49fe8c30f0cef8e43d8cfc6468","client_details":{"accept_language":"de-DE","browser_height":null,"browser_ip":"95.91.229.24","browser_width":null,"session_hash":null,"user_agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.1 Mobile/15E148 Safari/604.1"},"closed_at":null,"confirmed":true,"contact_email":"prema_h@hotmail.de","created_at":"2022-10-25T21:09:43+02:00","currency":"EUR","current_subtotal_price":"39.98","current_subtotal_price_set":{"shop_money":{"amount":"39.98","currency_code":"EUR"},"presentment_money":{"amount":"39.98","currency_code":"EUR"}},"current_total_discounts":"0.00","current_total_discounts_set":{"shop_money":{"amount":"0.00","currency_code":"EUR"},"presentment_money":{"amount":"0.00","currency_code":"EUR"}},"current_total_duties_set":null,"current_total_price":"39.98","current_total_price_set":{"shop_money":{"amount":"39.98","currency_code":"EUR"},"presentment_money":{"amount":"39.98","currency_code":"EUR"}},"current_total_tax":"6.38","current_total_tax_set":{"shop_money":{"amount":"6.38","currency_code":"EUR"},"presentment_money":{"amount":"6.38","currency_code":"EUR"}},"customer_locale":"de-DE","device_id":null,"discount_codes":[],"email":"prema_h@hotmail.de","estimated_taxes":false,"financial_status":"paid","fulfillment_status":null,"gateway":"paypal","landing_site":"/","landing_site_ref":null,"location_id":null,"name":"#1014","note":null,"note_attributes":[],"number":103369,"order_number":104369,"order_status_url":"https://ohmyvalentine.com/31289475212/orders/b1865458af1ad7ae0afcd4041d61417b/authenticate?key=594a26643743cb51d5126118fe376b2b","original_total_duties_set":null,"payment_gateway_names":["paypal"],"phone":null,"presentment_currency":"EUR","processed_at":"2022-10-25T21:09:39+02:00","processing_method":"express","reference":"d0697c3a98e23e0c5abc23a9bbf02f60","referring_site":"https://www.google.com/","source_identifier":"d0697c3a98e23e0c5abc23a9bbf02f60","source_name":"web","source_url":null,"subtotal_price":"39.98","subtotal_price_set":{"shop_money":{"amount":"39.98","currency_code":"EUR"},"presentment_money":{"amount":"39.98","currency_code":"EUR"}},"tags":"","tax_lines":[{"price":"6.38","rate":0.19,"title":"DE MwSt","price_set":{"shop_money":{"amount":"6.38","currency_code":"EUR"},"presentment_money":{"amount":"6.38","currency_code":"EUR"}},"channel_liable":false}],"taxes_included":true,"test":false,"token":"b1865458af1ad7ae0afcd4041d61417b","total_discounts":"0.00","total_discounts_set":{"shop_money":{"amount":"0.00","currency_code":"EUR"},"presentment_money":{"amount":"0.00","currency_code":"EUR"}},"total_line_items_price":"39.98","total_line_items_price_set":{"shop_money":{"amount":"39.98","currency_code":"EUR"},"presentment_money":{"amount":"39.98","currency_code":"EUR"}},"total_outstanding":"0.00","total_price":"39.98","total_price_set":{"shop_money":{"amount":"39.98","currency_code":"EUR"},"presentment_money":{"amount":"39.98","currency_code":"EUR"}},"total_price_usd":"39.52","total_shipping_price_set":{"shop_money":{"amount":"0.00","currency_code":"EUR"},"presentment_money":{"amount":"0.00","currency_code":"EUR"}},"total_tax":"6.38","total_tax_set":{"shop_money":{"amount":"6.38","currency_code":"EUR"},"presentment_money":{"amount":"6.38","currency_code":"EUR"}},"total_tip_received":"0.00","total_weight":600,"updated_at":"2022-10-25T21:09:47+02:00","user_id":null,"billing_address":{"first_name":"Prema-Aramy","address1":"Bebelallee 23e","phone":null,"city":"Hamburg","zip":"22299","province":null,"country":"Germany","last_name":"Haupt","address2":"3.OG Mitte","company":null,"latitude":53.6007013,"longitude":9.9933213,"name":"Prema-Aramy Haupt","country_code":"DE","province_code":null},"customer":{"id":4510400905369,"email":"prema_h@hotmail.de","accepts_marketing":false,"created_at":"2020-12-27T22:56:33+01:00","updated_at":"2022-10-25T21:09:43+02:00","first_name":"Prema-Aramy ","last_name":"Haupt","orders_count":4,"state":"disabled","total_spent":"206.41","last_order_id":5244761637132,"note":null,"verified_email":true,"multipass_identifier":null,"tax_exempt":false,"tags":"","last_order_name":"#omv104369","currency":"EUR","phone":null,"accepts_marketing_updated_at":"2022-10-23T11:46:51+02:00","marketing_opt_in_level":null,"tax_exemptions":[],"sms_marketing_consent":null,"admin_graphql_api_id":"gid://shopify/Customer/4510400905369","default_address":{"id":8424661647628,"customer_id":4510400905369,"first_name":"Prema-Aramy","last_name":"Haupt","company":null,"address1":"Bebelallee 23e","address2":"3.OG Mitte","city":"Hamburg","province":null,"country":"Germany","zip":"22299","phone":null,"name":"Prema-Aramy Haupt","province_code":null,"country_code":"DE","country_name":"Germany","default":true}},"discount_applications":[],"fulfillments":[],"line_items":[{"id":12902213648652,"admin_graphql_api_id":"gid://shopify/LineItem/12902213648652","fulfillable_quantity":2,"fulfillment_service":"manual","fulfillment_status":null,"gift_card":false,"grams":300,"name":"Personalisierte Tasse - Beste Freundinnen mit Birthstones ( 2 Frauen) - Personalisierte Tasse / Weiß / 300ml","origin_location":{"id":2962502910105,"country_code":"DE","province_code":"","name":"Oh my Valentine Warehouse","address1":"Albrechtstraße 102","address2":"","city":"Berlin","zip":"12103"},"price":"19.99","price_set":{"shop_money":{"amount":"19.99","currency_code":"EUR"},"presentment_money":{"amount":"19.99","currency_code":"EUR"}},"product_exists":true,"product_id":7972543791372,"properties":[{"name":"Frau Links: Name","value":"Dorna "},{"name":"Frau rechts: Name","value":"Prema"},{"name":"customization_id","value":9452382}],"quantity":2,"requires_shipping":true,"sku":"B101AA","taxable":true,"title":"Personalisierte Tasse - Beste Freundinnen mit Birthstones ( 2 Frauen)","total_discount":"0.00","total_discount_set":{"shop_money":{"amount":"0.00","currency_code":"EUR"},"presentment_money":{"amount":"0.00","currency_code":"EUR"}},"variant_id":43564283527436,"variant_inventory_management":null,"variant_title":"Personalisierte Tasse / Weiß / 300ml","vendor":"TeeInBlue","tax_lines":[{"channel_liable":false,"price":"6.38","price_set":{"shop_money":{"amount":"6.38","currency_code":"EUR"},"presentment_money":{"amount":"6.38","currency_code":"EUR"}},"rate":0.19,"title":"DE MwSt"}],"duties":[],"discount_allocations":[]}],"payment_terms":null,"refunds":[],"shipping_address":{"first_name":"Prema-Aramy","address1":"Bebelallee 23e","phone":null,"city":"Hamburg","zip":"22299","province":null,"country":"Germany","last_name":"Haupt","address2":"3.OG Mitte","company":null,"latitude":53.6007013,"longitude":9.9933213,"name":"Prema-Aramy Haupt","country_code":"DE","province_code":null},"shipping_lines":[{"id":4426317594892,"carrier_identifier":"650f1a14fa979ec5c74d063e968411d4","code":"Versicherter Standard Versand (3-5 Werktage)","delivery_category":null,"discounted_price":"0.00","discounted_price_set":{"shop_money":{"amount":"0.00","currency_code":"EUR"},"presentment_money":{"amount":"0.00","currency_code":"EUR"}},"phone":null,"price":"0.00","price_set":{"shop_money":{"amount":"0.00","currency_code":"EUR"},"presentment_money":{"amount":"0.00","currency_code":"EUR"}},"requested_fulfillment_service_id":null,"source":"shopify","title":"Versicherter Standard Versand (3-5 Werktage)","tax_lines":[{"channel_liable":false,"price":"0.00","price_set":{"shop_money":{"amount":"0.00","currency_code":"EUR"},"presentment_money":{"amount":"0.00","currency_code":"EUR"}},"rate":0.19,"title":"DE MwSt"}],"discount_allocations":[]}],"shopName":"doggieshoppie.myshopify.com"}
  console.log("manualOrderReceiver "+shopName+" "+token+" "+orderId+" "+endpoint)
  var xhttp1 = new XMLHttpRequest();
  xhttp1.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var data = JSON.parse(this.responseText)
      var z = JSON.stringify(data)
      var zzz = z.slice(9, z.length - 1)
      var zz = JSON.parse(zzz)
      zz["shopName"]=shopName;
      //sending data to PHP
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = async function() {
        if (this.readyState == 4 && this.status == 200) {
          await orders.updateOne({ shop: shopName, orderId: orderId }, {$set: {status: "success"}})
        }
        else if (this.readyState == 4 && this.status !== 200){
          console.log(this.status);
          console.log(this.responseText);
          await orders.updateOne({ shop: shopName, orderId: orderId }, {$set: {status: "failure"}})
        }
      };
      xhttp.open("POST", "https://www.podsolutionshopify.com"+endpoint, true);
      xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
      xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhttp.setRequestHeader('user', 'myvalentine');
      xhttp.setRequestHeader('pass', '$2y$12$FAzIRc0F1zWAsrsCt3c2Sexs2x7Hd6bpag6su5swjKtysteM5gtOu');
      xhttp.send(JSON.stringify(temp));
    }
    else if (this.readyState == 4 && this.status !== 200){
      console.log(this.responseText);
    }
  }
  let url1 = 'https://'+shopName+'/admin/api/2021-04/orders/' + orderId +'.json';
  xhttp1.open("GET", url1, true);
  xhttp1.setRequestHeader('X-Shopify-Access-Token', token);
  xhttp1.setRequestHeader('Content-type', 'application/json');
  xhttp1.send();
};
//#endregion
//#endregion
//#region DATABASE *DONE*
//#region INSERT SHOP
async function insertShop(data){
  try {
      await shops.create(data, (err,result) => {
          if(err){
              console.log('error ' + err); 
          }
          else{
              console.log('result ' + result);
          }
      })
  } catch (err) {
      console.log(err);
  }
}
//#endregion
//#region DELETE SHOP
async function deleteShop(shopName){
  try {
      await shops.deleteOne({shop:shopName}), (err,result) => {
          if(err){
              console.log('error ' + err); 
          }
          else{
              console.log('result ' + result);
          }
      }
      await orders.deleteMany({shop:shopName}), (err,result) => {
          if(err){
              console.log('error ' + err); 
          }
          else{
              console.log('result ' + result);
          }
      }
  } catch (err) {
      console.log(err);
  }
}
//#endregion
//#region INSERT ORDER
async function insertOrder(data){
  try {
      await orders.create(data, (err,result) => {
          if(err){
              console.log('error ' + err); 
          }
          else{
              console.log('result ' + result);
          }
      })
  } catch (err) {
      console.log(err);
  }
}
//#endregion
//#endregion
//#region SERVER OPTIONS *DONE*
  router.get("(/_next/static/.*)", handleRequest);
  router.get("/_next/webpack-hmr", handleRequest);
  router.get("(.*)", handleRequest);

  server.use(router.allowedMethods());
  server.use(router.routes());
  console.log("It's a Development Server");
  server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
  });
})
//#endregion