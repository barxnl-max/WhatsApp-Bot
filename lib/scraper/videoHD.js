const crypto = require("crypto");
async function videoHD(buffer) {
  const baseApi = "https://api.unblurimage.ai";
  const productSerial = crypto.randomUUID().replace(/-/g, "");
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function jsonFetch(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      return {
        ok: false,
        status: res.status,
        raw: text
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        raw: json
      };
    }
    return {
      ok: true,
      data: json
    };
  }
  const uploadForm = new FormData();
  uploadForm.set("video_file_name", `cli-${Date.now()}.mp4`);
  const upload = await jsonFetch(`${baseApi}/api/upscaler/v1/ai-video-enhancer/upload-video`, {
    method: "POST",
    body: uploadForm
  });
  if (!upload.ok || upload.data.code !== 100000) {
    return {
      success: false,
      message: "Upload gagal"
    };
  }
  const {
    url: uploadUrl,
    object_name
  } = upload.data.result || {};
  if (!uploadUrl || !object_name) {
    return {
      success: false,
      message: "Upload invalid"
    };
  }
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "content-type": "video/mp4"
    },
    body: buffer
  });
  if (!putRes.ok) {
    return {
      success: false,
      message: "Upload video gagal"
    };
  }
  const cdnUrl = `https://cdn.unblurimage.ai/${object_name}`;
  const jobForm = new FormData();
  jobForm.set("original_video_file", cdnUrl);
  jobForm.set("resolution", "2k");
  jobForm.set("is_preview", "false");
  const createJob = await jsonFetch(`${baseApi}/api/upscaler/v2/ai-video-enhancer/create-job`, {
    method: "POST",
    body: jobForm,
    headers: {
      "product-serial": productSerial,
      authorization: ""
    }
  });
  if (!createJob.ok || createJob.data.code !== 100000) {
    return {
      success: false,
      message: "Create job gagal"
    };
  }
  const {
    job_id
  } = createJob.data.result || {};
  if (!job_id) {
    return {
      success: false,
      message: "Job tidak valid"
    };
  }
  const start = Date.now();
  let attempt = 0;
  while (true) {
    attempt++;
    const job = await jsonFetch(`${baseApi}/api/upscaler/v2/ai-video-enhancer/get-job/${job_id}`, {
      method: "GET",
      headers: {
        "product-serial": productSerial,
        authorization: ""
      }
    });
    if (!job.ok) {
      return {
        success: false,
        message: "Get job gagal"
      };
    }
    if (job.data.code === 100000) {
      const result = job.data.result || {};
      if (result.output_url) {
        return {
          success: true,
          result: {
            url: result.output_url,
            resolution: "2k",
            job_id
          }
        };
      }
    }
    if (Date.now() - start > 600000) {
      return {
        success: false,
        message: "Timeout proses"
      };
    }
    await sleep(attempt === 1 ? 20000 : 10000);
  }
}
module.exports = videoHD;
