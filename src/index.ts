import axios from "axios";
import * as admin from "firebase-admin";

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://taskventure001-default-rtdb.firebaseio.com/",
});

const db = admin.database();
const documentsRef = db.ref("/req");

documentsRef.limitToLast(1).on("child_added", async (snapshot) => {
  const request = snapshot.val();
  console.log("Request -->", request);

  try {
    const response = await axios({
      url: `http://localhost:32000/douglas`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: request,
    });
    console.log(response.data);
    snapshot.ref.update({ response: response.data });
  } catch (error: any) {
    console.log("Something went wrong -->", error.message);
  }
});
