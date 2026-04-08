const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const axios = require("./node_modules/axios/index.d.cts");
const { CookieJar } = require("./node_modules/tough-cookie/dist/index.d.cts");
const { wrapper } = require("axios-cookiejar-support");
require("dotenv").config();

const NAUKRI_EMAIL = process.env.NAUKRI_EMAIL;
const NAUKRI_PASSWORD = process.env.NAUKRI_PASSWORD;
const RESUME_PATH = process.env.RESUME_PATH || "data/resume/Rizabul_SDE_Resume_DCE.pdf";
const FORM_KEY = process.env.NAUKRI_FORM_KEY;

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36";

// ================== UTIL ==================
function generateFileKey(length) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return "U" + result;
}

// Create axios session with cookie jar (like Python requests.Session)
const jar = new CookieJar();
const session = wrapper(axios.create({ jar, withCredentials: true }));

// ================== LOGIN ==================
async function login() {
  console.log("Step 1: Logging in...");

  const resp = await session.post(
    "https://www.naukri.com/central-login-services/v1/login",
    { username: NAUKRI_EMAIL, password: NAUKRI_PASSWORD },
    {
      headers: {
        "accept": "application/json",
        "appid": "105",
        "clientid": "d3skt0p",
        "content-type": "application/json",
        "referer": "https://www.naukri.com/nlogin/login",
        "systemid": "jobseeker",
        "user-agent": UA,
        "x-requested-with": "XMLHttpRequest",
      },
    }
  );

  // Extract bearer token from cookies
  const cookies = await jar.getCookies("https://www.naukri.com");
  const tokenCookie = cookies.find((c) => c.key === "nauk_at");

  if (!tokenCookie) {
    throw new Error("Bearer token (nauk_at) not found in login cookies");
  }

  console.log("Login successful!");
  return tokenCookie.value;
}

// ================== FETCH PROFILE ID ==================
async function fetchProfileId(token) {
  console.log("Step 2: Fetching profile ID...");

  const resp = await session.get(
    "https://www.naukri.com/cloudgateway-mynaukri/resman-aggregator-services/v0/users/self/dashboard",
    {
      headers: {
        "accept": "application/json",
        "appid": "105",
        "clientid": "d3skt0p",
        "systemid": "Naukri",
        "user-agent": UA,
        "authorization": `Bearer ${token}`,
      },
    }
  );

  const profileId = resp.data?.dashBoard?.profileId || resp.data?.profileId;

  if (!profileId) {
    throw new Error("Profile ID not found in response");
  }

  console.log(`Profile ID: ${profileId}`);
  return profileId;
}

// ================== UPLOAD RESUME ==================
async function uploadResume(resumeContent, fileName, fileKey) {
  console.log(`Step 3: Uploading resume file: ${fileName}`);

  const FormData = (await import("form-data")).default;
  const form = new FormData();
  form.append("file", resumeContent, { filename: fileName, contentType: "application/pdf" });
  form.append("formKey", FORM_KEY);
  form.append("fileName", fileName);
  form.append("uploadCallback", "true");
  form.append("fileKey", fileKey);

  const resp = await axios.post("https://filevalidation.naukri.com/file", form, {
    headers: {
      ...form.getHeaders(),
      "accept": "application/json",
      "appid": "105",
      "origin": "https://www.naukri.com",
      "referer": "https://www.naukri.com/",
      "systemid": "fileupload",
      "user-agent": UA,
    },
  });

  console.log("File uploaded to Naukri!");

  let resolvedKey = fileKey;
  if (!resp.data[fileKey]) {
    resolvedKey = Object.keys(resp.data)[0] || fileKey;
  }
  return resolvedKey;
}

// ================== UPDATE PROFILE ==================
async function updateProfile(token, profileId, fileKey) {
  console.log("Step 4: Updating profile with new resume...");

  const profileUrl = `https://www.naukri.com/cloudgateway-mynaukri/resman-aggregator-services/v0/users/self/profiles/${profileId}/advResume`;

  const resp = await session.post(
    profileUrl,
    {
      textCV: {
        formKey: FORM_KEY,
        fileKey: fileKey,
        textCvContent: null,
      },
    },
    {
      headers: {
        "accept": "application/json",
        "authorization": `Bearer ${token}`,
        "content-type": "application/json",
        "origin": "https://www.naukri.com",
        "referer": "https://www.naukri.com/",
        "user-agent": UA,
        "x-http-method-override": "PUT",
        "x-requested-with": "XMLHttpRequest",
        "appid": "105",
        "clientid": "d3skt0p",
        "systemid": "Naukri",
      },
    }
  );

  console.log("Profile updated successfully!");
}

// ================== MAIN ==================
(async () => {
  if (!NAUKRI_EMAIL || !NAUKRI_PASSWORD) {
    console.error("Set NAUKRI_EMAIL and NAUKRI_PASSWORD in .env");
    process.exit(1);
  }
  if (!FORM_KEY) {
    console.error("Set NAUKRI_FORM_KEY in .env");
    console.error("To get it: DevTools > Network > upload resume manually > find POST to filevalidation.naukri.com > copy formKey");
    process.exit(1);
  }

  const resumePath = path.resolve(RESUME_PATH);
  if (!fs.existsSync(resumePath)) {
    console.error(`Resume not found: ${resumePath}`);
    process.exit(1);
  }

  const resumeContent = fs.readFileSync(resumePath);
  if (resumeContent.subarray(0, 4).toString() !== "%PDF") {
    console.error("File is not a valid PDF");
    process.exit(1);
  }

  const fileName = path.basename(resumePath);
  const fileKey = generateFileKey(13);

  try {
    const token = await login();
    const profileId = await fetchProfileId(token);
    const resolvedFileKey = await uploadResume(resumeContent, fileName, fileKey);
    await updateProfile(token, profileId, resolvedFileKey);

    console.log("\nDone! Resume updated successfully. Your profile will appear as recently updated to recruiters.");
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    process.exit(1);
  }
})();
