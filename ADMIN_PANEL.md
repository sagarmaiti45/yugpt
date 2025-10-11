# YuGPT Admin Panel Documentation

## Overview

The admin panel allows you to select and manage the AI model used by all YuGPT extension users. Changes are applied instantly to all active users.

## Access

**URL:** `http://localhost:3000/admin` (local) or `https://your-app.railway.app/admin` (production)

**Password:** Set in environment variable `ADMIN_PASSWORD` (default: `admin123`)

## Features

### 1. Model Selection by Tier

#### Premium Models ⭐
- **GPT-4 Omni** - Best quality, multimodal flagship
- **Claude 3.5 Sonnet** - Excellent for analysis and long content
- **Gemini Pro 1.5** - Huge 1M token context window

#### Optimized Models ⚡
- **GPT-4 Omni Mini** - Fast, affordable, high quality ($0.15/1M)
- **Claude 3 Haiku** - Quick responses, good accuracy ($0.25/1M)
- **Gemini Flash 1.5** - Fastest, cheapest ($0.075/1M)

#### Free Models 🆓
- **Llama 3.1 8B (Free)** - Open-source, great for testing
- **Gemma 2 9B (Free)** - Google's free model
- **Mistral 7B (Free)** - Efficient open-source
- **Qwen 2 7B (Free)** - Multilingual support

### 2. Custom Model Selection

Enter any OpenRouter model ID directly:
- Format: `provider/model-name`
- Example: `anthropic/claude-3-opus`
- Find models at: https://openrouter.ai/models

## Model Recommendations

### For Production (Best Quality)
```
openai/gpt-4o
anthropic/claude-3.5-sonnet
```

### For Cost-Effective Production
```
openai/gpt-4o-mini
google/gemini-flash-1.5
```

### For Testing/Development
```
meta-llama/llama-3.1-8b-instruct:free
google/gemma-2-9b-it:free
```

## API Endpoints

### Get Available Models
```bash
GET /api/admin/models
Authorization: Bearer YOUR_ADMIN_PASSWORD

Response:
{
  "success": true,
  "data": {
    "models": { ... },
    "currentModel": "openai/gpt-4o",
    "settings": { ... }
  }
}
```

### Select Model
```bash
POST /api/admin/models/select
Authorization: Bearer YOUR_ADMIN_PASSWORD
Content-Type: application/json

{
  "modelId": "openai/gpt-4o-mini",
  "adminUserId": "admin"
}

Response:
{
  "success": true,
  "data": {
    "selectedModel": "openai/gpt-4o-mini",
    "message": "Model updated successfully"
  }
}
```

### Get Current Settings
```bash
GET /api/admin/settings
Authorization: Bearer YOUR_ADMIN_PASSWORD

Response:
{
  "success": true,
  "data": {
    "selectedModel": "openai/gpt-4o",
    "lastUpdated": "2025-01-10T12:00:00.000Z",
    "updatedBy": "admin"
  }
}
```

## Security

### Current Implementation
- Simple password-based authentication
- Password stored in environment variable
- Token stored in browser localStorage

### Future Enhancements (TODO)
- [ ] JWT-based authentication
- [ ] Session management
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Multi-admin support with roles
- [ ] Database storage for settings

## Environment Variables

```env
# Required
ADMIN_PASSWORD=your_secure_password_here

# Optional
DEFAULT_MODEL=openai/gpt-4o  # Fallback if not configured
```

## Usage Flow

1. **Access admin panel** at `/admin`
2. **Login** with admin password
3. **View current model** (displayed at top)
4. **Browse models** by tier (Premium/Optimized/Free)
5. **Select model** by clicking "Select Model" button
6. **Or enter custom model ID** in the custom model section
7. **Confirmation** - All users now use the new model

## Model Selection Impact

When you change the model:
- ✅ **Instant effect** - All new summaries use the new model
- ✅ **No user action required** - Transparent to users
- ✅ **Cost control** - Switch to cheaper models anytime
- ✅ **Quality control** - Upgrade for better results

## Cost Management Tips

1. **Start with free models** during testing
2. **Use optimized models** for production (great balance)
3. **Reserve premium models** for high-value use cases
4. **Monitor usage** via OpenRouter dashboard
5. **Switch models based on traffic** (free at night, optimized during peak)

## Troubleshooting

### Cannot login
- Check `ADMIN_PASSWORD` in Railway environment variables
- Default password is `admin123` if not set
- Clear browser localStorage and try again

### Model selection not working
- Verify OpenRouter API key is valid
- Check custom model ID format: `provider/model-name`
- Review server logs for errors

### Changes not reflecting
- Refresh extension after model change
- Check browser console for errors
- Verify backend is running

## Future Database Integration

When implementing database storage (MongoDB/PostgreSQL):

```javascript
// Replace in adminConfig.js
export async function getSelectedModel() {
  const settings = await db.settings.findOne({ key: 'selectedModel' });
  return settings?.value || process.env.DEFAULT_MODEL;
}

export async function updateSelectedModel(modelId, adminUserId) {
  await db.settings.updateOne(
    { key: 'selectedModel' },
    { value: modelId, updatedBy: adminUserId, updatedAt: new Date() },
    { upsert: true }
  );

  await db.auditLog.insert({
    action: 'MODEL_CHANGE',
    modelId,
    adminUserId,
    timestamp: new Date()
  });
}
```

## Support

For issues or questions:
- GitHub: https://github.com/sagarmaiti45/yugpt
- Check server logs for detailed error messages
- Review OpenRouter documentation for model-specific issues
