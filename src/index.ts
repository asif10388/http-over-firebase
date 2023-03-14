import axios from "axios";
import * as admin from "firebase-admin";

import dotenv from "dotenv";
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: (process.env.PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.database();
const documentsRef = db.ref("/req");

documentsRef.limitToLast(1).on("child_added", async (snapshot) => {
  const req = snapshot.val().req;
  const key = snapshot.key;
  const { url, method, headers, body } = req;

  try {
    const response = await axios({
      url,
      method,
      headers,
      data: body,
    });

    console.log(response.data);

    await admin.database().ref(`res/${key}`).set({
      headers: response.headers,
      body: response.data,
    });

    snapshot.ref.update({ response: response.data });
  } catch (error: any) {
    console.log("Something went wrong -->", error.message);
  }
});
