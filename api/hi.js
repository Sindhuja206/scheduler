const admin=require("firebase-admin");
if(!admin.apps.length){
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
module.exports=async(req,res)=>{
    try{
        const token="c-XeAYfsRRilZyX0x4W4hr:APA91bE3xBoLsf5uOj3vljTmW4EYwv5BMAPxCLIKfU-IxSVyocFPlJTr5tw6_AdRo6N2GTUGyd7ReuiIeWg02D5Q-IWP5gOfbY9xOzqhYvFzcoiyFlFZV_s";
        const message={
            notification:{
                title:"Hi👋🙌",
                body:"Sample test notification"
            },
            token
        };
        const response=await admin.messaging().send(message);
        return res.status(200).json({success:true,messageId: response});
    }
    catch(error){
        res.status(500).json({success:false,error:error.message});
    }
}
