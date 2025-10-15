# Manual Python Dependencies Installation for Railway

## Why Manual Installation?

Installing Whisper and its dependencies takes 5-10 minutes, which can cause Railway deployment timeouts. This guide shows how to install them manually after deployment.

---

## 🚀 Quick Start (After Deployment)

### **Step 1: Open Railway Shell**

1. Go to Railway Dashboard: https://railway.app/dashboard
2. Select your **YuGPT Backend** project
3. Click on **"Deploy"** tab
4. Click **"Shell"** button (or use Railway CLI)

---

### **Step 2: Install Python Dependencies**

Run these commands in the Railway shell:

```bash
# Navigate to python-scripts directory
cd src/python-scripts

# Install Python packages (this will take 5-10 minutes)
pip install -r requirements.txt

# Verify installation
pip list
```

**Expected output:**
```
youtube-transcript-api    x.x.x
yt-dlp                    x.x.x
openai-whisper            x.x.x
ffmpeg-python             x.x.x
```

---

### **Step 3: Test Each Method**

After installation, test if each method works:

#### **Test 1: Python API (Fast)**
```bash
cd src/python-scripts
python3 youtube-sub-transcript.py "dQw4w9WgXcQ"
```

**Expected:** JSON output with transcript data in <1 second

---

#### **Test 2: Whisper AI (Slow - Optional)**
```bash
cd src/python-scripts
python3 whisper_transcript.py "https://www.youtube.com/watch?v=jNQXAC9IVRw" tiny
```

**Expected:** JSON output with transcript after 1-5 minutes

---

## 📋 Installation Breakdown

### **Package 1: youtube-transcript-api** (Fast)
```bash
pip install youtube-transcript-api
```
- Size: ~2 MB
- Time: ~10 seconds
- Used for: Videos with existing subtitles

---

### **Package 2: yt-dlp** (Medium)
```bash
pip install yt-dlp
```
- Size: ~5 MB
- Time: ~30 seconds
- Used for: Downloading audio for Whisper

---

### **Package 3: openai-whisper** (SLOW)
```bash
pip install openai-whisper
```
- Size: ~500 MB (includes PyTorch)
- Time: 5-10 minutes
- Used for: AI transcription of videos without subtitles

**Note:** This is the package that causes timeouts during deployment

---

### **Package 4: ffmpeg-python** (Fast)
```bash
pip install ffmpeg-python
```
- Size: ~1 MB
- Time: ~5 seconds
- Used for: Audio processing with Whisper

---

## 🔧 Troubleshooting

### **Issue: pip command not found**

**Solution:** Python should be installed via nixpacks. Verify:
```bash
python3 --version
pip --version
```

If not found, Railway deployment may have failed. Check Railway logs.

---

### **Issue: ffmpeg not found**

**Solution:** ffmpeg is installed via nixpacks. Verify:
```bash
ffmpeg -version
```

If not found, check if `nixpacks.toml` is in your repo.

---

### **Issue: Installation taking too long**

**Expected behavior:** Whisper installation takes 5-10 minutes due to PyTorch dependencies. This is normal.

**Option 1:** Wait it out (recommended)

**Option 2:** Install without Whisper:
```bash
pip install youtube-transcript-api yt-dlp ffmpeg-python
```

Your backend will still work for 99% of videos (those with subtitles). Whisper is only needed for videos without any captions.

---

### **Issue: Out of memory during Whisper installation**

**Solution:** Upgrade Railway plan or skip Whisper installation. The Python API method works for most videos.

---

## 🎯 What Works Without Whisper?

If you skip Whisper installation, your system still has **3-tier fallback:**

1. ✅ Python youtube-transcript-api (Fast)
2. ✅ Node.js libraries (Fast)
3. ❌ ~~Whisper AI~~ (Skipped)
4. ✅ DOM extraction (Frontend fallback)

**This covers 95%+ of YouTube videos** since most have auto-generated captions.

---

## 📊 Installation Status Check

After installation, check which methods are working:

```bash
# Method 1: Python API (Required)
cd src/python-scripts
python3 youtube-sub-transcript.py "dQw4w9WgXcQ"

# Method 2: Node.js (Already installed)
# No test needed - part of npm dependencies

# Method 3: Whisper (Optional)
python3 whisper_transcript.py "https://www.youtube.com/watch?v=jNQXAC9IVRw" tiny

# Method 4: DOM (Frontend)
# No backend dependencies needed
```

---

## ⚡ Quick Install (Minimum Required)

If you only want the fast methods:

```bash
cd src/python-scripts
pip install youtube-transcript-api
```

This installs only the Python API method (~10 seconds), which is the fastest and covers most videos.

---

## 🚀 After Installation

Once Python packages are installed:

1. **Restart your Railway service** (optional but recommended)
2. **Test the extension** on a YouTube video
3. **Check Railway logs** to see which method was used

You should see:
```
[PYTHON-API] 🟢 Attempting to fetch transcript...
[PYTHON-API] ✅ SUCCESS! Retrieved 45 segments
```

---

## 💾 Persistence

**Good news:** Python packages persist across deployments once installed!

You only need to install them once. Future deployments will keep the packages unless:
- You deploy to a new Railway service
- Railway rebuilds the container from scratch
- You change the Python version in nixpacks.toml

---

## 🆘 Need Help?

If manual installation doesn't work:

1. Check Railway logs for errors
2. Verify Python is installed: `python3 --version`
3. Verify pip works: `pip --version`
4. Check available disk space: `df -h`

**Common fix:** If Railway shell doesn't work, use Railway CLI:
```bash
railway run pip install -r src/python-scripts/requirements.txt
```
