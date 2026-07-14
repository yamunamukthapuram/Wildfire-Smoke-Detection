'use client';

import { useEffect, useState } from 'react';

const featureCards = [
  {
    title: 'Instant wildfire screening',
    text: 'Upload a photo and receive an instant wildfire or smoke risk estimate in seconds.'
  },
  {
    title: 'Clear visual insights',
    text: 'Review warm-color and smoke-like ratios in a clean, easy-to-understand dashboard.'
  },
  {
    title: 'Built for demos and reviews',
    text: 'A polished experience that feels ready for presentations, stakeholder reviews, and public showcases.'
  }
];

const sampleImages = [
  {
    label: 'Smoke-like scene',
    value: 'smoke'
  },
  {
    label: 'Warm-toned scene',
    value: 'warm'
  }
];

const workflowSteps = [
  'Upload a clear image from a camera or drone feed',
  'Run the AI analysis to detect smoke-like or warm regions',
  'Review the confidence score and key indicators in one place'
];

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [riskLabel, setRiskLabel] = useState('Awaiting analysis');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelection = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Please choose an image smaller than 5 MB.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setSelectedName(file.name);
    setErrorMessage('');
    setResult(null);
    setProgress(0);
    setRiskLabel('Awaiting analysis');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleFileSelection(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer?.files?.[0];
    handleFileSelection(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fileInput = event.currentTarget.elements.namedItem('image');
    const file = fileInput?.files?.[0];

    if (!file) {
      setErrorMessage('Please choose an image first.');
      setResult({ label: 'Please choose an image first.', confidence: 0, warmRatio: 0, smokeRatio: 0 });
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setProgress(10);

    const progressTimer = window.setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 10));
    }, 140);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed.');
      }

      setProgress(100);
      setResult(data);
      if (data.warmRatio > 0.12) {
        setRiskLabel('High risk');
      } else if (data.smokeRatio > 0.08) {
        setRiskLabel('Moderate risk');
      } else {
        setRiskLabel('Low risk');
      }
    } catch (error) {
      setProgress(0);
      setErrorMessage(error.message || 'Prediction failed. Please try another image.');
      setResult({ label: 'Prediction failed. Please try another image.', confidence: 0, warmRatio: 0, smokeRatio: 0 });
    } finally {
      window.clearInterval(progressTimer);
      setIsLoading(false);
    }
  };

  const handleSampleClick = (sample) => {
    const label = sample === 'smoke' ? 'Smoke-like sample' : 'Warm-toned sample';
    setSelectedName(label);
    setRiskLabel('Awaiting analysis');
    setResult(null);
    setErrorMessage('');
    setProgress(0);
    setPreviewUrl('');
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">🔥</span>
          <div>
            <p className="topbar-title">Wildfire Guard</p>
            <p className="topbar-subtitle">Rapid image-based screening for smoke and wildfire signals</p>
          </div>
        </div>
        <div className="topbar-links">
          <a href="#upload">Upload</a>
          <a href="#insights">Insights</a>
          <a href="#workflow">Workflow</a>
        </div>
      </header>

      <section className="hero-card" id="upload">
        <div className="hero-copy">
          <p className="eyebrow">Next-gen wildfire screening</p>
          <h1>Detect smoke and heat patterns before they escalate.</h1>
          <p className="description">
            Upload a photo to quickly assess whether it suggests smoke, haze, or potentially active wildfire conditions.
          </p>

          <div className="hero-actions">
            <a className="primary-btn" href="#upload">Analyze image</a>
            <a className="secondary-btn" href="#workflow">See how it works</a>
          </div>

          <div className="pill-row">
            <span className="pill">Live upload</span>
            <span className="pill">Instant analysis</span>
            <span className="pill">Safety insights</span>
          </div>

          <div className="status-badge">
            <span className={`status-dot ${isLoading ? 'active' : ''}`} />
            {isLoading ? 'Live analysis in progress' : result ? 'Results ready' : 'Fully ready for real-time screening'}
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-card">
            <div className="hero-panel-top">
              <span className="panel-badge">Live screening</span>
              <span className="panel-pill">Instant</span>
            </div>

            <form onSubmit={handleSubmit} className="upload-form">
              <label
                className={`upload-box ${isDragging ? 'drag-active' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <span className="upload-title">Choose an image</span>
                <span className="upload-subtitle">PNG, JPG, and WEBP supported • drag and drop ready</span>
                <input type="file" name="image" accept="image/*" onChange={handleFileChange} />
              </label>

              <div className="meta-row">
                <span className="helper-text">{selectedName ? `Selected: ${selectedName}` : 'No file selected yet'}</span>
                <span className="helper-text">{result ? 'Analysis complete' : 'Awaiting upload'}</span>
              </div>

              {isLoading ? (
                <div className="progress-shell" aria-label="Analysis progress">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              ) : null}

              <div className="sample-row">
                {sampleImages.map((sample) => (
                  <button key={sample.value} type="button" className="sample-button" onClick={() => handleSampleClick(sample.value)}>
                    {sample.label}
                  </button>
                ))}
              </div>

              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? 'Analyzing image…' : 'Analyze image'}
              </button>

              {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
            </form>
          </div>
        </div>
      </section>

      <section className="feature-grid" id="features">
        {featureCards.map((feature) => (
          <article key={feature.title} className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="workflow-card" id="workflow">
        <div className="workflow-copy">
          <p className="eyebrow">How it works</p>
          <h2>Simple workflow, clear output</h2>
          <p>
            This experience is designed to make wildfire screening approachable for field teams, educators, and technical reviewers.
          </p>
        </div>
        <div className="workflow-list">
          {workflowSteps.map((step, index) => (
            <div key={step} className="workflow-item">
              <span className="workflow-number">0{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      {previewUrl ? (
        <section className="preview-section">
          <div className="preview-wrap">
            <img src={previewUrl} alt="Selected preview" className="preview-image" />
          </div>
        </section>
      ) : null}

      {result ? (
        <section className="result-box" id="insights">
          <div className="result-header">
            <h2>{result.label}</h2>
            <span className="confidence-pill">{(result.confidence * 100).toFixed(0)}% confidence</span>
          </div>
          <div className="risk-row">
            <span className={`risk-pill ${riskLabel.toLowerCase().includes('high') ? 'high' : riskLabel.toLowerCase().includes('moderate') ? 'moderate' : 'low'}`}>{riskLabel}</span>
            <span className="helper-text">Screening summary</span>
          </div>
          <div className="metrics-grid">
            <div>
              <span className="metric-label">Warm-color ratio</span>
              <strong>{(result.warmRatio * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="metric-label">Smoke-like ratio</span>
              <strong>{(result.smokeRatio * 100).toFixed(1)}%</strong>
            </div>
          </div>
          <div className="insight-banner">
            <span className="insight-title">Interpretation</span>
            <p>
              {result.warmRatio > 0.1
                ? 'The image shows a strong warm-toned signal, which often suggests heat, glowing flames, or active fire-related conditions. In practical terms, this could be a warning sign that warrants closer inspection, especially if the scene is outdoors or near dry vegetation.'
                : result.smokeRatio > 0.12
                  ? 'The image contains a noticeable smoke-like pattern, which may indicate haze, airborne particles, or early-stage smoke conditions. This does not confirm a fire by itself, but it is a meaningful signal that the scene may involve reduced visibility or fire activity nearby.'
                  : 'The visual indicators are relatively mild, so the scene appears less likely to suggest active wildfire conditions. However, this result should still be treated as a screening signal rather than a definitive conclusion, especially if the image quality is low or the scene is complex.'}
            </p>
          </div>
        </section>
      ) : (
        <section className="result-box muted">
          <h2>Ready when you are</h2>
          <p>Upload an image to see a structured risk summary and visual preview here.</p>
        </section>
      )}

      <footer className="footer">
        <p>Wildfire Guard</p>
      </footer>
    </main>
  );
}
