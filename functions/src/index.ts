import axios from "axios";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

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

exports.proxyRequest = functions.https.onRequest(async (req, res) => {
  const targetUrl = `http://${req.url}`;

  const body = req.body;
  const method = req.method;
  const headers = req.headers;

  const requestDataRef = admin.database().ref("req").push({
    body,
    method,
    headers,
  });

  const requestId = requestDataRef.key;

  try {
    const axiosResponse = await axios({
      method,
      data: body,
      url: targetUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    await admin.database().ref(`res/${requestId}`).set({
      headers: axiosResponse.headers,
      body: axiosResponse.data,
    });

    res.send(axiosResponse.data);
  } catch (error: any) {
    res.send(error.response.data);
  }
});
