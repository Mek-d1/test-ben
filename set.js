const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const axios = require('axios');
const { spawn } = require('child_process');

async function downloadAndExtractZip(zipUrl) {
  const tempZipPath = path.join(__dirname, 'temp.zip');

  try {
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

    const zip = new AdmZip(tempZipPath);
    zip.extractAllTo(__dirname, true);
    console.log("✅ ZIP extracted.");

    fs.unlinkSync(tempZipPath);
    console.log("🗑️ ZIP file deleted.");

    // اجرای فایل بات
    console.log("🚀 Starting index111.js...");
    const bot = spawn('node', ['index111.js'], {
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

const zipUrl = 'https://files.catbox.moe/dg2q6n.zip'; // لینک فایل ZIP
downloadAndExtractZip(zipUrl);