import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult([]);

    try {
      const base64Image = await toBase64(file);
      
      // 2025年11月20日实测最稳的免费HuggingFace年鉴空间（fffiloni）
      const response = await fetch("https://fffiloni-yearbook-photo.hf.space/call/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [base64Image] })
      });

      const { event_id } = await response.json();

      // 轮询结果（通常20-35秒出图）
      const poll = async () => {
        const res = await fetch(`https://fffiloni-yearbook-photo.hf.space/call/predict/${event_id}`);
        const data = await res.json();
        if (data.status === "PENDING") {
          setTimeout(poll, 3000);
        } else {
          setResult(data.data[0]); // 直接返回4张图链接
          setLoading(false);
        }
      };
      poll();

    } catch (err) {
      alert("Server busy, try again in a few minutes~");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>Free AI Yearbook Photos 2025 🏫✨</h1>
      <p>Upload a selfie → Get 90s American high school yearbook photos (totally free)</p>

      <form onSubmit={handleSubmit} style={{ margin: '40px 0' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: '20px' }}
        />
        <br />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px 30px', fontSize: '18px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          {loading ? 'Generating... (20-40s)' : 'Generate My Yearbook Photos'}
        </button>
      </form>

      {loading && <p>🕓 Working on your 90s glow-up...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
        {result.map((url, i) => (
          <img key={i} src={url} alt={`Yearbook ${i+1}`} style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
        ))}
      </div>

      {/* AdSense 广告位 */}
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-你的ID" crossorigin="anonymous"></script>
      <ins className="adsbygoogle"
           style={{ display:"block" }}
           data-ad-client="ca-pub-你的ID"
           data-ad-slot="1234567890"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
  );
}