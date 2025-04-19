const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');

async function downloadAndExtractZip(zipUrl) {
  const tempZipPath = path.join(__dirname, 'temp.zip');
  const extractPath = path.join(__dirname); // استخراج فایل‌ها در همان مسیر

  try {
    // دانلود فایل ZIP
    const response = await axios({
      method: 'GET',
      url: zipUrl,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(tempZipPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log("✅ ZIP downloaded.");

    // استخراج فایل ZIP
    const zip = new AdmZip(tempZipPath);
    zip.extractAllTo(extractPath, true);  // استخراج در مسیر فعلی
    console.log("✅ ZIP extracted.");

    // حذف فایل ZIP پس از استخراج
    fs.unlinkSync(tempZipPath);
    console.log("🗑️ ZIP file deleted.");

    // اجرای فایل index.js
    console.log("🚀 Starting index.js...");
    const bot = spawn('node', ['index.js'], {
      stdio: 'inherit',
      cwd: __dirname,
    });

    bot.on('exit', code => {
      console.log(`🔁 Bot exited with code: ${code}`);
    });

  } catch (error) {
    console.error("❌ Error during setup:", error);
  }
}

// لینک فایل ZIP
const zipUrl = 'https://files.catbox.moe/dg2q6n.zip'; 
downloadAndExtractZip(zipUrl);