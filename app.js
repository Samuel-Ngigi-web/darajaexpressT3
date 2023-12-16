const https = require("https");
const express = require("express");
//const axios = require("axios");
const {get} = require("request");
const moment = require("moment");
const mongoose = require("mongoose");
//const { access } = require("fs");
const app = express();
app.use(express.json());


mongoose.connect("mongodb+srv://Admin-Samuel:test1234@cluster0.7fp58pn.mongodb.net/darajaapiv1");
//DARAJA Schema
const DarajaCallbackUrlEndpoint= new mongoose.Schema(
  {
    
    MerchantRequestID: String,
    CheckoutRequestID: String,
    ResultCode: String,
    ResultDesc: String,
    TransactionAmount: String,
    MpesaCode: String,
    TransactionDate: String,
    PhoneNumber: String,
    //      const confirmedPayments = [];
    // const {MerchantRequestID, CheckoutRequestID, ResultCode,ResultDesc, MpesaCode, TransactionDate,PhoneNumber} = req.body;
  }
)


const DarajaCallback = mongoose.model("callbackUrlModel", DarajaCallbackUrlEndpoint)

app.post("/callback", function(req, res){
  //console.log(req.body.Body["stkCallback"])
   const newCallbackDetails = new DarajaCallback({
   // transacDetails: Body,
   MerchantRequestID: req.body.Body.stkCallback.MerchantRequestID,
    CheckoutRequestID: req.body.Body.stkCallback.CheckoutRequestID,
    ResultCode: req.body.Body.stkCallback.ResultCode,
    ResultDesc: req.body.Body.stkCallback.ResultDesc,
    //callbackMetadata
    //TransactionAmount: req.body.Body.stkCallback.CallbackMetadata.item[0].Value,
    // MpesaCode: req.body.Body.stkCallback.CallbackMetadata.item[1].Value,
    // TransactionDate: req.body.Body.stkCallback.CallbackMetadata.item[3].Value,
    // PhoneNumber: req.body.Body.stkCallback.CallbackMetadata.item[4].Value,
  })

  newCallbackDetails.save();
  console.log("saved!")
  console.log(newCallbackDetails)
  res.send(newCallbackDetails)

})











const confirmedPayments = [];

app.get("/", function(req, res){
    res.send("You are about to generate an access token")
})

//ACCESS_TOKEN ROUTE
app.get("/access_token", function(req, res){
   getAccessToken()
   .then((accessToken=>{
    res.send("Your access token is: "+ accessToken)
   }))
   .catch(console.log)
});

//STK_PUSH ROUTE
app.get("/stk_push", function(req,res){
    getAccessToken()
    .then((accessToken)=>{
        //Mpesa express/url under query btn
       // const fetchURL = "sandboxhttps://.safaricom.co.ke/mpesa/stkpushquery/v1/query",
       //mpesa express/ url under simulate btn
       const fetchURL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        auth = 'Bearer ' + accessToken;
       // const bsShortCode = "174379";
        const passKey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
        var timeStamp = moment().format("YYYYMMDDHHmmss");
       const password = new Buffer.from("174379" + passKey + timeStamp).toString("base64");
      
       get(   {  
                url: fetchURL,
                method: "POST",
                headers: {
                    Authorization: auth,
                },
                json: {
                    BusinessShortCode: "174379",
                    Password: password,
                    Timestamp: timeStamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: "1",
                    PartyA: "254796567084",
                    PartyB: "174379",
                    PhoneNumber: "254796567084",
                    CallBackURL: "https://greetapi.onrender.com/darajatest",
                    AccountReference: "SaNPAY",
                    TransactionDesc: "test2sandbox",
                    }
              },
              function (err, response, body){
                if (err){
                    console.log(err);
                }
                else{
                    console.log("Request is sent successfully. Waiting for Mpesa pin to be entered to complete the transaction");
                    // res.send("Hold on... Waiting for Mpesa pin to be entered to complete the transaction" + json(body));
                    res.status(200).json(body);
                   
                }
              }
           );
     })
    .catch(console.log);
});

//CALLBACK URL HANDLER
app.post("/myapi/payment/confirmation", function(req, res){
    confirmedPayments.push(req.body);

    console.log(confirmedPayments);
    console.log("Payment method has been hit")
})


//ACCESS_TOKEN FUNCTION, Test2 Sandbox used. This fuction was working
 function getAccessToken(){
                //Test2 sandbox credentials
        //const consumerKey = "ODCmr8AAjRFAaDSYv6s8v1NaT3undjyz";
        //const consumerSecrete = "PxbvYG7NIsdirMfw";
               //Test3 sandbox credentials
              const consumerKey = "QjVHPt2PGQGiUVydAPiAfpYqzdd82xz8";
              const consumerSecrete = "ZyOlkAHMceQtZLuG";
        const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

        const auth = "Basic " + new Buffer.from(consumerKey + ":" + consumerSecrete).toString('base64');
        return new Promise((response, reject) => {
            get({
                url: url,
                headers:{
                    Authorization: auth,
                },
            },
            function (err, res, body){
                // console.log(body);
                var jsonBody = JSON.parse(body);
                if(err){
                    reject(err);
                }
                else{
                    const accessToken = jsonBody.access_token;
                    
                    response(accessToken);
                }
            })
        })
     }

     //ACCESS TOKEN FUNCTION 2
    //  function getAccessToken2(){
    //     const consumerKey = "ODCmr8AAjRFAaDSYv6s8v1NaT3undjyz";
    //     const consumerSecrete = "PxbvYG7NIsdirMfw";
    //     const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    //     const auth = "Basic " + new Buffer.from(consumerKey + ":" + consumerSecrete).toString('base64');
    //     return new Promise((response, reject) => {
    //         get({
    //             url: url,
    //             headers:{
    //                 Authorization: auth,
    //             },
    //         },
    //         function (err, res, body){
    //             // console.log(body);
    //             var jsonBody = JSON.parse(body);
    //             if(err){
    //                 reject(err);
    //             }
    //             else{
    //                 const accessToken = jsonBody.access_token;
                    
    //                 response(accessToken);
    //             }
    //         })
    //     })
    //  }


const PORT = process.env.PORT
app.listen(PORT || 3000, function(err){
    if(err){
        console.log(err)
    }
    else{
        console.log("The server is running on port 3000")
    }
})


//Example of POST details sent your database through the callback url you specified 
// {
// 	"Body": 
// 	{
// 		"stkCallback": 
// 		{
// 			"MerchantRequestID": "21605-295434-4",
// 			"CheckoutRequestID": "ws_CO_04112017184930742",
// 			"ResultCode": 0,
// 			"ResultDesc": "The service request is processed successfully.",
// 			"CallbackMetadata": 
// 			{
// 				"Item": 
// 				[
// 					{
// 						"Name": "Amount",
// 						"Value": 1
// 					},
// 					{
// 						"Name": "MpesaReceiptNumber",
// 						"Value": "LK451H35OP"
// 					},
// 					{
// 						"Name": "Balance"
// 					},
// 					{
// 						"Name": "TransactionDate",
// 						"Value": 20171104184944
// 					},
// 					{
// 						"Name": "PhoneNumber",
// 						"Value": 254727894083
// 					}
// 				]
// 			}
// 		}
// 	}
// }