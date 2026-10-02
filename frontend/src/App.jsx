import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userQuestion = question;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userQuestion },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
        }),
      });

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
          content: "Backend se connection nahi ho pa raha.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <div className="container">

        <header className="header">
          <h1>HireMeAI</h1>
          <p>AI Assistant for Candidate Screening</p>
        </header>

        <div className="chat-box">

          {messages.length === 0 && (
            <div className="welcome">
              <h2>Hi! 👋</h2>
              <p>
                Ask me anything about the candidate's resume.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.role === "user"
                  ? "user-message"
                  : "ai-message"
              }`}
            >
              <div className="message-label">
                {message.role === "user" ? "You" : "HireMeAI"}
              </div>

              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message ai-message">
              <div className="message-label">HireMeAI</div>
              <div className="message-content">
                Thinking...
              </div>
            </div>
          )}

        </div>

        <div className="input-area">

          <input
            type="text"
            placeholder="Ask something about the candidate..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                askQuestion();
              }
            }}
          />

          <button
            onClick={askQuestion}
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default App;