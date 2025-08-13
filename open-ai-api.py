from dotenv import load_dotenv
import os
import google.generativeai as genai
from PIL import Image

load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Your Prompt
prompt = "What do you see on this image?"

# Image file path
image_path = "static/images/test-image.jpeg"

# List available models first
try:
    # Get list of all available models
    # for model in genai.list_models():
    #     if 'vision' in model.name.lower():
    #         print(f"Found vision model: {model.name}")
    #     print(f"Available model: {model.name}")
    
    # Load the image
    image = Image.open(image_path)
    
    # Use Gemini 2.5 Flash Vision model
    model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    # Generate response from the model
    response = model.generate_content([prompt, image])
    
    # Print the response
    print(response.text)
    
except Exception as e:
    print(f"An error occurred: {e}")