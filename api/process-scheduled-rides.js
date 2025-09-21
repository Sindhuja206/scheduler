const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../serviceAccountKey.json")),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

    // Convert both times into comparable fields
    const nowDay = now.getDay();
    const nowHour = now.getHours();
    const nowMinute = now.getMinutes();

    const pastDay = fiveMinutesAgo.getDay();
    const pastHour = fiveMinutesAgo.getHours();
    const pastMinute = fiveMinutesAgo.getMinutes();

    // Query rides scheduled for *today* within last 5 min window
    // (You might want to store a single `scheduledAt` timestamp in your rides collection — easier)
    const snap = await db.collection("scheduled_rides")
      .where("dayOfWeek", "==", nowDay)
      .where("hour", "==", nowHour) // same hour
      .where("minute", ">=", pastMinute)
      .where("minute", "<=", nowMinute)
      .get();

    const responses = [];

    for (const doc of snap.docs) {
      const ride = doc.data();

      // Fetch driver details
      const driverDoc = await db.collection("users").doc(ride.driverId).get();
      if (!driverDoc.exists) continue;

      const token = driverDoc.data().fcmtoken;

      // Create a new ride record
      const newRide = {
        customer_uid: ride.customerId,
        driver_uid: ride.driverId,
        from_latlng: new admin.firestore.GeoPoint(
          ride.pickup.latitude,
          ride.pickup.longitude
        ),
        to_latlng: new admin.firestore.GeoPoint(
          ride.drop.latitude,
          ride.drop.longitude
        ),
        from_address: ride.pickup,
        to_address: ride.drop,
        distance: ride.distance,
        amount: ride.estimatedamount,
        status: "requested",
        createdat: admin.firestore.FieldValue.serverTimestamp(),
      };

      const createdRide = await db.collection("rides").add(newRide);

      // Send FCM notification
      const message = {
        notification: {
          title: "Ride Request",
          body: "Your scheduled ride is ready!",
        },
        data: {
          ride_id: createdRide.id,
          from_address: JSON.stringify(ride.pickup),
          to_address: JSON.stringify(ride.drop),
          distance: ride.distance.toString(),
          amount: ride.estimatedamount.toString(),
        },
        token: token,
      };

      const response = await admin.messaging().send(message);
      responses.push({ rideId: createdRide.id, messageId: response });
    }

    return res.status(200).json({ success: true, results: responses });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
