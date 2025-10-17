# Admin Max Tokens Control System

Complete documentation for controlling output length of preset summaries via admin panel.

---

## 📋 Overview

The **Admin Max Tokens System** allows administrators to control the **maximum output length** for each preset summary template. This provides fine-grained control over AI response lengths without modifying code.

### Key Features:
- ✅ **Per-Preset Control** - Set different max tokens for each preset
- ✅ **Global Default** - Fallback value for any preset
- ✅ **Live Updates** - Changes apply immediately without restart
- ✅ **Validation** - Prevents invalid values (100-10000 tokens)
- ✅ **Audit Trail** - Tracks who made changes and when

---

## 🎯 Current Default Configuration

Located in: `backend/src/config/adminConfig.js`

```javascript
presetMaxTokens: {
  'general-summary': 4000,          // ✨ General Summary
  'extract-quotes': 3000,           // 💬 Extract Quotes
  'how-to-steps': 4000,             // 📚 How-To Steps
  'facts-statistics': 3500,         // 📊 Facts & Statistics
  'arguments-positions': 4000,      // ⚖️ Arguments & Positions
  'qa-extraction': 3000,            // ❓ Q&A Extraction
  'action-items': 2500,             // ✅ Action Items
  'key-moments': 2500,              // 🎬 Key Moments
  'code-commands': 4000,            // 💻 Code & Commands
  'story-examples': 3500,           // 📖 Story & Examples
  'chapter-breakdown': 5000,        // 📑 Chapter Breakdown
  'short-form-content': 6000,       // 📱 Short-Form Content
  'content-repurpose': 7000         // ♻️ Content Repurpose
}

defaultMaxTokens: 4000  // Fallback for any preset not listed
```

### Token Guidelines:
- **1 token ≈ 0.75 words** (English)
- **2500 tokens ≈ 1875 words** - Short responses
- **4000 tokens ≈ 3000 words** - Medium responses
- **6000 tokens ≈ 4500 words** - Long responses
- **7000 tokens ≈ 5250 words** - Very long responses

---

## 🔐 Authentication

All admin endpoints require authentication:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_ADMIN_PASSWORD'
}
```

Set admin password in `.env`:
```bash
ADMIN_PASSWORD=your_secure_password_here
```

---

## 📡 API Endpoints

### 1. GET All Max Tokens Configuration

Get current max tokens for all presets.

**Endpoint:** `GET /api/admin/presets/max-tokens`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_PASSWORD
```

**Response:**
```json
{
  "success": true,
  "data": {
    "presets": [
      {
        "id": "general-summary",
        "name": "✨ General Summary",
        "maxTokens": 4000
      },
      {
        "id": "content-repurpose",
        "name": "♻️ Content Repurpose",
        "maxTokens": 7000
      }
      // ... more presets
    ],
    "default": 4000
  }
}
```

**cURL Example:**
```bash
curl -X GET \
  https://yugpt-production.up.railway.app/api/admin/presets/max-tokens \
  -H "Authorization: Bearer admin123"
```

---

### 2. POST Update Single Preset

Update max tokens for a specific preset.

**Endpoint:** `POST /api/admin/presets/max-tokens/update`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_PASSWORD
Content-Type: application/json
```

**Body:**
```json
{
  "presetId": "content-repurpose",
  "maxTokens": 8000,
  "adminUserId": "admin@example.com"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "presetId": "content-repurpose",
    "maxTokens": 8000,
    "message": "Max tokens for preset 'content-repurpose' updated to 8000"
  }
}
```

**cURL Example:**
```bash
curl -X POST \
  https://yugpt-production.up.railway.app/api/admin/presets/max-tokens/update \
  -H "Authorization: Bearer admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "presetId": "content-repurpose",
    "maxTokens": 8000
  }'
```

---

### 3. POST Update Default Max Tokens

Update the global default max tokens.

**Endpoint:** `POST /api/admin/presets/max-tokens/update-default`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_PASSWORD
Content-Type: application/json
```

**Body:**
```json
{
  "maxTokens": 5000,
  "adminUserId": "admin@example.com"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "maxTokens": 5000,
    "message": "Default max tokens updated to 5000"
  }
}
```

**cURL Example:**
```bash
curl -X POST \
  https://yugpt-production.up.railway.app/api/admin/presets/max-tokens/update-default \
  -H "Authorization: Bearer admin123" \
  -H "Content-Type: application/json" \
  -d '{"maxTokens": 5000}'
```

---

### 4. POST Bulk Update Multiple Presets

Update multiple presets at once.

**Endpoint:** `POST /api/admin/presets/max-tokens/bulk-update`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_PASSWORD
Content-Type: application/json
```

**Body:**
```json
{
  "presets": {
    "general-summary": 4500,
    "content-repurpose": 8000,
    "short-form-content": 6500,
    "chapter-breakdown": 5500
  },
  "adminUserId": "admin@example.com"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updatedCount": 4,
    "message": "Bulk updated max tokens for 4 presets"
  }
}
```

**cURL Example:**
```bash
curl -X POST \
  https://yugpt-production.up.railway.app/api/admin/presets/max-tokens/bulk-update \
  -H "Authorization: Bearer admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "presets": {
      "content-repurpose": 8000,
      "short-form-content": 6500
    }
  }'
```

---

## 🖥️ Using the Test Script

A test script is provided to interact with the admin API.

**Location:** `backend/test-hindi-models/test_admin_max_tokens.js`

### Run the test:
```bash
cd backend/test-hindi-models
node test_admin_max_tokens.js
```

### Available functions:

```javascript
// Get current configuration
await getMaxTokensConfig();

// Update single preset
await updatePresetMaxTokens('content-repurpose', 8000);

// Update default
await updateDefaultMaxTokens(5000);

// Bulk update multiple presets
await bulkUpdatePresets({
  'general-summary': 4500,
  'content-repurpose': 8000
});

// Set recommended values for all presets
await setRecommendedValues();
```

---

## 💡 How It Works

### Flow:

1. **Admin sets max tokens** via API endpoint
2. **Backend stores** in `adminConfig.js` (in-memory)
3. **Frontend fetches config** via `/api/summary/config`
4. **Frontend uses preset-specific max tokens** when calling OpenRouter API

### Example Flow:

```javascript
// 1. Frontend gets config
const config = await apiService.getOpenRouterConfig();
// Returns: { ..., presetMaxTokens: { presets: {...}, default: 4000 } }

// 2. Frontend extracts max tokens for current preset
const maxTokens = config.presetMaxTokens.presets['general-summary'] || 4000;
// Result: 4000

// 3. Frontend sends to OpenRouter with this limit
{
  model: 'google/gemini-2.5-flash-lite',
  messages: [...],
  max_tokens: 4000  // From admin configuration
}
```

---

## 🎨 Building an Admin Panel UI

### Example React Component:

```jsx
import React, { useState, useEffect } from 'react';

function AdminMaxTokensPanel() {
  const [presets, setPresets] = useState([]);
  const [defaultTokens, setDefaultTokens] = useState(4000);
  const adminPassword = 'admin123'; // Store securely!

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    const response = await fetch(
      'https://yugpt-production.up.railway.app/api/admin/presets/max-tokens',
      {
        headers: {
          'Authorization': `Bearer ${adminPassword}`
        }
      }
    );
    const data = await response.json();
    setPresets(data.data.presets);
    setDefaultTokens(data.data.default);
  }

  async function updatePreset(presetId, newMaxTokens) {
    const response = await fetch(
      'https://yugpt-production.up.railway.app/api/admin/presets/max-tokens/update',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminPassword}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          presetId,
          maxTokens: parseInt(newMaxTokens)
        })
      }
    );

    if (response.ok) {
      fetchConfig(); // Refresh
      alert('Updated successfully!');
    }
  }

  return (
    <div className="admin-panel">
      <h2>Max Tokens Configuration</h2>

      <div className="default-section">
        <label>Default Max Tokens:</label>
        <input
          type="number"
          value={defaultTokens}
          onChange={(e) => setDefaultTokens(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Preset</th>
            <th>Current Max Tokens</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {presets.map(preset => (
            <tr key={preset.id}>
              <td>{preset.name}</td>
              <td>
                <input
                  type="number"
                  defaultValue={preset.maxTokens}
                  id={`input-${preset.id}`}
                  min="100"
                  max="10000"
                />
              </td>
              <td>
                <button onClick={() => {
                  const input = document.getElementById(`input-${preset.id}`);
                  updatePreset(preset.id, input.value);
                }}>
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 📊 Recommended Values by Preset Type

### Short Responses (1500-2000 words):
```
key-moments: 2500
extract-quotes: 3000
action-items: 2500
```

### Medium Responses (2500-3000 words):
```
general-summary: 4000
facts-statistics: 3500
qa-extraction: 3000
code-commands: 4000
story-examples: 3500
```

### Long Responses (3500-4000 words):
```
how-to-steps: 4000
arguments-positions: 4000
chapter-breakdown: 5000
```

### Very Long Responses (4500-5000 words):
```
short-form-content: 6000
content-repurpose: 7000
```

---

## ⚠️ Important Notes

### 1. **max_tokens is a CEILING, not a target**
- The AI may stop at 1000 tokens even if max is 6000
- Actual length depends on prompt design, not just max_tokens

### 2. **Validation**
- Min: 100 tokens
- Max: 10000 tokens
- Values outside this range will be rejected

### 3. **Cost Implications**
Higher max_tokens = potential for:
- Higher API costs
- Longer processing time
- More bandwidth usage

### 4. **Current Limitation**
- Values are stored **in-memory** (lost on restart)
- TODO: Migrate to database for persistence

### 5. **When to Increase max_tokens**
Only if you notice:
- Responses being cut off mid-sentence
- Important information missing at the end
- Users complaining about incomplete summaries

---

## 🔄 Migration to Database (TODO)

When implementing persistent storage:

```javascript
// MongoDB example
const PresetConfig = new Schema({
  presetId: { type: String, required: true, unique: true },
  maxTokens: { type: Number, min: 100, max: 10000 },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: String }
});

// PostgreSQL example
CREATE TABLE preset_config (
  preset_id VARCHAR(50) PRIMARY KEY,
  max_tokens INTEGER CHECK (max_tokens >= 100 AND max_tokens <= 10000),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(100)
);
```

---

## 🐛 Troubleshooting

### Issue: Changes not taking effect
**Solution:** Frontend caches config. Reload page or clear cache.

### Issue: Getting 401 Unauthorized
**Solution:** Check ADMIN_PASSWORD in .env matches the one you're using.

### Issue: "Max tokens must be between 100 and 10000"
**Solution:** Validation error. Use values within the valid range.

### Issue: Responses still too short
**Cause:** max_tokens is just the ceiling. The **prompt design** determines actual length.
**Solution:** Modify the preset prompt in `summaryPresets.js` to request more detail.

---

## 📞 Support

For questions or issues:
- Backend config: `backend/src/config/adminConfig.js`
- API routes: `backend/src/routes/admin.js`
- Frontend usage: `services/apiService.js`

---

**Last Updated:** 2025-01-17
