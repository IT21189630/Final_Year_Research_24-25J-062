import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./dailyChallenge.css";

const DailyChallenge = () => {
  const [activeTab, setActiveTab] = useState("Best-attempts");
  const [challenge, setChallenge] = useState([]);

  const todayDate = new Date().toLocaleDateString();

  useEffect(() => {
    const fetchChallengeById = async () => {
      try {
        const response = await axios.get("http://localhost:5000/gamified-learning/api/submission-management/challenge/67482a990ff156a20f5632d2");
        setChallenge(response.data);

      } catch (err) {
        console.error("Failed to fetch the challenge. Please check the ID and try again.");
      }
    };
    fetchChallengeById()
  }, []);

  // Mock Data
  const highScoreParticipants = [
    { name: "Alice", score: 95, time: "10:30 AM", img: "/images/alice.jpg" },
    { name: "Bob", score: 90, time: "11:00 AM", img: "/images/bob.jpg" },
  ];

  const [discussions, setDiscussions] = useState([
    { id: 1, question: "How to center a div?", replies: ["Use flexbox!", "Try margin: auto."] },
  ]);

  const [newQuestion, setNewQuestion] = useState("");

  const handleNewQuestion = () => {
    if (newQuestion.trim()) {
      setDiscussions([...discussions, { id: discussions.length + 1, question: newQuestion, replies: [] }]);
      setNewQuestion("");
    }
  };

  return (
    <div className='container'>
      <h1>Daily Challenge</h1>
      <p>{todayDate}</p>
      <div style={{ marginBottom: "20px" }}>
        {["Best-attempts", "Task", "Discussions"].map((tab) => (
          <button
            key={tab}
            style={{
              margin: "0 20px 0 0",
              padding: "10px 20px",
              cursor: "pointer",
              backgroundColor: activeTab === tab ? "var(--evening-blue)" : "#E0E0E0",
              color: activeTab === tab ? "#fff" : "#000",
              border: "none",
              borderRadius: "5px",
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Best-attempts" && (
        <div>
          <h2>High Score Participants</h2>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {highScoreParticipants.map((participant, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "10px",
                }}
              >
                <img
                  src={participant.img}
                  alt={participant.name}
                  style={{ width: "50px", height: "50px", borderRadius: "50%", marginRight: "10px" }}
                />
                <div>
                  <strong>{participant.name}</strong>
                  <p>Score: {participant.score}</p>
                  <p>Submitted at: {participant.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "Task" && (
        <div>
          <div>
            <h4>{challenge.title}</h4>
            <h6 style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
              {challenge.description}
            </h6>
            <br></br>
            <h5>
              For reference, your final output should visually match the following:<br></br>
            </h5>
            <img style={{width:600}} src={challenge.refImage} alt="My Image" ></img>
          </div>
          <Link to="/student/dashboard/attemptChallenge">
            <button className="attempt-btn">
              Attempt
            </button>
          </Link>
          
        </div>
      )}

      {activeTab === "Discussions" && (
        <div>
          <h2>Discussions</h2>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question..."
              style={{
                padding: "10px",
                width: "calc(100% - 100px)",
                marginRight: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
            <button onClick={handleNewQuestion} style={{ padding: "10px 20px", cursor: "pointer" }}>
              Ask
            </button>
          </div>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {discussions.map((discussion) => (
              <li key={discussion.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                <p>
                  <strong>Q:</strong> {discussion.question}
                </p>
                {discussion.replies.map((reply, index) => (
                  <p key={index} style={{ marginLeft: "20px" }}>
                    <strong>Reply:</strong> {reply}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DailyChallenge;
