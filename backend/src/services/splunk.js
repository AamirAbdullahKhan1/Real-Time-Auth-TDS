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
      time: Date.parse(eventData.timestamp) / 1000,
      host: process.env.SPLUNK_HEC_HOST || "ironclad-backend",
      source: "ironclad-auth",
      sourcetype: process.env.SPLUNK_HEC_SOURCETYPE || "_json",
      ...(process.env.SPLUNK_HEC_INDEX ? { index: process.env.SPLUNK_HEC_INDEX } : {}),
      event: eventData
    };

    const response = await axios.post(SPLUNK_HEC_URL, payload, {
      headers: {
        Authorization: `Splunk ${SPLUNK_HEC_TOKEN}`,
        "Content-Type": "application/json"
      },
      timeout: 5000
    });

    if (response.data?.code !== 0) throw new Error("HEC did not accept the event");
    return response.data;
  } catch (error) {
    console.error(
      "Failed to send event to Splunk:",
      error.response?.data || error.message
    );
  }
}
