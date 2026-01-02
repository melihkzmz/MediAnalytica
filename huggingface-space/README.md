# MediAnalytica - Hugging Face Space Deployment

This is the deployment setup for MediAnalytica disease detection API on Hugging Face Spaces.

## 📋 Setup Instructions

### Step 1: Upload Models to Hugging Face Hub

1. **Install Hugging Face Hub**:
   ```bash
   pip install huggingface-hub
   ```

2. **Login to Hugging Face**:
   ```bash
   huggingface-cli login
   ```
   Or in Python:
   ```python
   from huggingface_hub import login
   login()
   ```

3. **Update `upload_models.py`**:
   - Replace `YOUR_HF_USERNAME` with your actual Hugging Face username
   - Update model paths if they're in different locations

4. **Run the upload script**:
   ```bash
   cd huggingface-space
   python upload_models.py
   ```

   This will create 4 repositories on your Hugging Face account:
   - `YOUR_USERNAME/medianalytica-skin-model`
   - `YOUR_USERNAME/medianalytica-bone-model`
   - `YOUR_USERNAME/medianalytica-lung-model`
   - `YOUR_USERNAME/medianalytica-eye-model`

### Step 2: Update app.py with Your Username

Edit `app.py` and set your Hugging Face username:

```python
HF_USERNAME = os.environ.get('HF_USERNAME', 'YOUR_ACTUAL_USERNAME')
```

Or set it as an environment variable in your Hugging Face Space settings.

### Step 3: Upload Files to Your Space

1. **Go to your Space** on huggingface.co
2. **Click "Files and versions"** tab
3. **Upload these files**:
   - `Dockerfile`
   - `requirements.txt`
   - `app.py`
   - `README.md` (optional)

### Step 4: Set Environment Variable (Optional)

In your Space settings, add:
- **Variable**: `HF_USERNAME`
- **Value**: Your Hugging Face username

This allows the app to automatically use your username without hardcoding it.

## 🚀 How It Works

1. **On Space Startup**:
   - The app downloads models from Hugging Face Hub
   - Models are cached in `models/` directory
   - If download fails, it tries local paths as fallback

2. **API Endpoints**:
   - `GET /` - API status
   - `GET /health` - Health check
   - `GET /classes/<disease_type>` - Get class names (skin, bone, lung, eye)
   - `POST /predict/<disease_type>` - Predict disease from image

3. **Example Request**:
   ```bash
   curl -X POST https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/predict/skin \
     -F "image=@test_image.jpg"
   ```

## 📁 File Structure

```
huggingface-space/
├── Dockerfile          # Docker configuration
├── requirements.txt    # Python dependencies
├── app.py             # Main Flask application
├── upload_models.py   # Script to upload models to Hub
└── README.md          # This file
```

## 🔧 Troubleshooting

### Models Not Loading

1. **Check HF_USERNAME**: Make sure it's set correctly
2. **Check Repository Names**: Verify repos exist at `YOUR_USERNAME/medianalytica-*-model`
3. **Check Model Files**: Ensure models are uploaded correctly to Hub
4. **Check Logs**: Look at Space logs for download errors

### Model Download Fails

- Models will fallback to local `models/` directory
- You can manually upload models to the Space using Git LFS (for smaller models)

### Out of Memory

- Hugging Face Spaces have limited memory
- Consider loading models on-demand instead of all at startup
- Use model quantization to reduce size

## 📝 Notes

- Models are downloaded on first startup (can take a few minutes)
- Models are cached, so subsequent restarts are faster
- Each model is ~100-500MB, so total download can be 1-2GB
- Make sure your Space has enough storage allocated

## 🔐 Security

- Models are public by default (change `private=True` in `upload_models.py` if needed)
- API has CORS enabled for frontend access
- No authentication required (add if needed for production)

