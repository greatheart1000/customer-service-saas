import React, { useState } from 'react';
import './ImageRecognition.css';

const ImageRecognition = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('describe'); // describe, extract, custom

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate the response
      setTimeout(() => {
        let simulatedResult = '';
        switch (mode) {
          case 'describe':
            simulatedResult = `This is a sample image description. The image appears to contain a landscape with mountains, trees, and a lake. The sky is blue with some clouds.`;
            break;
          case 'extract':
            simulatedResult = `Sample extracted text from image:

"Welcome to Intelligent Customer Service"
"Powered by Coze AI"
"Multimodal Interaction Platform"`;
            break;
          case 'custom':
            simulatedResult = `Answer to your question "${question}":\n\nBased on the image content, it appears to be a demonstration of the image recognition feature. The system can analyze various visual elements and provide detailed descriptions.`;
            break;
          default:
            simulatedResult = 'Image processed successfully.';
        }
        setResult(simulatedResult);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setQuestion('');
    setResult('');
    setMode('describe');
  };

  return (
    <div className="image-recognition">
      <h1>🖼️ Image Recognition</h1>
      <p className="subtitle">Upload an image and let AI analyze its content</p>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Operation:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="describe"
                  checked={mode === 'describe'}
                  onChange={(e) => setMode(e.target.value)}
                />
                Describe Image
              </label>
              <label>
                <input
                  type="radio"
                  value="extract"
                  checked={mode === 'extract'}
                  onChange={(e) => setMode(e.target.value)}
                />
                Extract Text
              </label>
              <label>
                <input
                  type="radio"
                  value="custom"
                  checked={mode === 'custom'}
                  onChange={(e) => setMode(e.target.value)}
                />
                Custom Question
              </label>
            </div>
          </div>

          {mode === 'custom' && (
            <div className="form-group">
              <label htmlFor="question">Your Question:</label>
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something about the image..."
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="image">Upload Image:</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {imagePreview && (
            <div className="image-preview">
              <h3>Image Preview:</h3>
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Analyze Image'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>

        {isLoading && <div className="spinner"></div>}

        {result && (
          <div className="result-container">
            <h3>Result:</h3>
            <pre>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageRecognition;