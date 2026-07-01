import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const SPLUNK_HEC_URL = process.env.SPLUNK_HEC_URL;
const SPLUNK_HEC_TOKEN = process.env.SPLUNK_HEC_TOKEN;

export async function sendToSplunk(eventData) {
  if (!SPLUNK_HEC_URL || !SPLUNK_HEC_TOKEN) {
    console.warn("Splunk HEC env vars missing. Skipping send.");
    return;
  }

  try {
    const payload = {
      time: Math.floor(Date.now() / 1000),
      host: "xamp-backend",
      source: "xamp-auth",
      sourcetype: "xamp:auth:json",
      index: "xen-auth",
      event: eventData
    };

    const response = await axios.post(SPLUNK_HEC_URL, payload, {
      headers: {
        Authorization: `Splunk ${SPLUNK_HEC_TOKEN}`,
        "Content-Type": "application/json"
      },
      timeout: 5000
    });

    return response.data;
  } catch (error) {
    console.error(
      "Failed to send event to Splunk:",
      error.response?.data || error.message
    );
  }
}