import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("https://hiremeai-yp6i.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.answer,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "I couldn't connect to the HireMeAI backend. Please make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="app-shell">

      {/* Background */}
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      {/* Main Application */}
      <div className="app-window">

        {/* TOP NAVBAR */}
        <header className="topbar">

          <div className="brand">
            <div className="brand-icon">
              ✦
            </div>

            <div>
              <h1>HireMeAI</h1>
              <span>AI Candidate Intelligence</span>
            </div>
          </div>

          <div className="top-actions">

            <div className="ai-status">
              <span className="status-dot"></span>
              AI Online
            </div>

            <button className="icon-button">
              ⚙
            </button>

            <div className="profile-avatar">
              V
            </div>

          </div>
        </header>


        {/* MAIN AREA */}
        <div className="workspace">

          {/* SIDEBAR */}
          <aside className="sidebar">

            <div className="candidate-section">

              <div className="candidate-avatar">
                V
              </div>

              <div className="candidate-info">
                <h2>Candidate</h2>
                <p>Resume Profile</p>
              </div>

            </div>


            <div className="sidebar-divider"></div>


            {/* Navigation */}
            <nav className="side-nav">

              <div className="nav-item active">
                <span>◈</span>
                AI Interview
              </div>

              <div className="nav-item">
                <span>▣</span>
                Resume
              </div>

              <div className="nav-item">
                <span>◇</span>
                Skills
              </div>

              <div className="nav-item">
                <span>◎</span>
                Experience
              </div>

            </nav>


            {/* Candidate Snapshot */}
            <div className="snapshot">

              <div className="snapshot-title">
                <span>Candidate Snapshot</span>
                <span className="verified">✓</span>
              </div>

              <div className="score-container">

                <div className="score-circle">
                  <strong>AI</strong>
                  <span>Ready</span>
                </div>

                <div>
                  <p className="score-label">Profile Status</p>
                  <h3>Analyzed</h3>
                </div>

              </div>

            </div>


            {/* Quick Info */}
            <div className="quick-info">

              <div className="info-row">
                <span>▸</span>
                <div>
                  <small>Analysis</small>
                  <strong>Resume Based</strong>
                </div>
              </div>

              <div className="info-row">
                <span>◉</span>
                <div>
                  <small>AI Model</small>
                  <strong>GPT OSS 20B</strong>
                </div>
              </div>

              <div className="info-row">
                <span>⌁</span>
                <div>
                  <small>Mode</small>
                  <strong>HR Interview</strong>
                </div>
              </div>

            </div>

          </aside>


          {/* CHAT AREA */}
          <main className="chat-area">

            {/* Chat Header */}
            <div className="chat-header">

              <div>

                <div className="eyebrow">
                  AI INTERVIEW ASSISTANT
                </div>

                <h2>Candidate Intelligence</h2>

                <p>
                  Ask questions and explore information extracted from the
                  candidate's resume.
                </p>

              </div>

              <button
                className="clear-button"
                onClick={clearChat}
                disabled={messages.length === 0}
              >
                ↻ Clear
              </button>

            </div>


            {/* CHAT CONTENT */}
            <div className="messages-container">

              {messages.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    ✦
                  </div>

                  <h2>
                    Start a conversation
                  </h2>

                  <p>
                    Ask HireMeAI anything about the candidate.
                    The AI will answer using the uploaded resume.
                  </p>


                  <div className="suggestion-grid">

                    <button
                      onClick={() =>
                        setQuestion("Tell me about the candidate")
                      }
                    >
                      <span>◈</span>
                      Tell me about the candidate
                    </button>

                    <button
                      onClick={() =>
                        setQuestion("What are the candidate's skills?")
                      }
                    >
                      <span>◇</span>
                      What are their skills?
                    </button>

                    <button
                      onClick={() =>
                        setQuestion(
                          "Tell me about the candidate's experience"
                        )
                      }
                    >
                      <span>◎</span>
                      Explain their experience
                    </button>

                    <button
                      onClick={() =>
                        setQuestion(
                          "What projects has the candidate worked on?"
                        )
                      }
                    >
                      <span>▣</span>
                      Show their projects
                    </button>

                  </div>

                </div>

              ) : (

                messages.map((message, index) => (

                  <div
                    key={index}
                    className={`message-row ${
                      message.role === "user"
                        ? "user-row"
                        : "ai-row"
                    }`}
                  >

                    {message.role === "ai" && (
                      <div className="ai-avatar">
                        ✦
                      </div>
                    )}

                    <div className="message-wrapper">

                      <div className="message-meta">
                        {message.role === "user"
                          ? "You"
                          : "HireMeAI"}

                        <span>
                          {message.role === "ai"
                            ? "AI Assistant"
                            : "HR Recruiter"}
                        </span>
                      </div>

                      <div
                        className={`message-bubble ${
                          message.role === "user"
                            ? "user-bubble"
                            : "ai-bubble"
                        }`}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                      </div>

                    </div>

                    {message.role === "user" && (
                      <div className="user-avatar">
                        V
                      </div>
                    )}

                  </div>

                ))

              )}


              {/* Loading */}
              {loading && (

                <div className="message-row ai-row">

                  <div className="ai-avatar">
                    ✦
                  </div>

                  <div className="message-wrapper">

                    <div className="message-meta">
                      HireMeAI
                      <span>AI Assistant</span>
                    </div>

                    <div className="message-bubble ai-bubble typing">

                      <span></span>
                      <span></span>
                      <span></span>

                    </div>

                  </div>

                </div>

              )}

            </div>


            {/* INPUT */}
            <div className="input-section">

              <div className="input-box">

                <div className="input-icon">
                  ✦
                </div>

                <input
                  type="text"
                  value={question}
                  placeholder="Ask anything about the candidate..."
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      askQuestion();
                    }
                  }}
                />

                <button
                  className="send-button"
                  onClick={askQuestion}
                  disabled={loading || !question.trim()}
                >
                  {loading ? "..." : "↑"}
                </button>

              </div>

              <div className="input-footer">

                <span>
                  ✦ AI answers are generated from the candidate's resume
                </span>

                <span>
                  Enter ↵ to send
                </span>

              </div>

            </div>

          </main>

        </div>

      </div>

    </div>
  );
}

export default App;