const admin=require("firebase-admin");
if(!admin.apps.length){
    admin.initializeApp({
        credential: admin.credential.cert(require("../serviceAccountKey.json")),
      });
}
module.exports=async(req,res)=>{
    try{
        const token="dIMN3dBYTYCvW5VHoFN-yT:APA91bEByMNiCpZ9hjhvW67qI_CB-UCeyWx7yWAaFGTQ8VbP8oqqZcnoxdF9ODtgWH7kH_3ASNJTykZSnreic_cj_azCQdkL_0NEJQPdW4TSquzW37XAfNQ";
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