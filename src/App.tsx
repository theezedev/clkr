import { useState, useEffect } from "react";
import "./App.css";
import pb from "./pocketbase";
import Confetti from "react-confetti-boom";
import LoginForm from "./components/LoginForm";
import { ToastContainer, toast } from 'react-toastify';

interface LeaderboardItem {
  id: string;
  name: string;
  count: number;
}

function App() {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, settoast]= useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const user = pb.authStore.model;
    if (user) {
      setUserId(user.id);
      setCount(user.count || 0);
      fetchLeaderboard();
    }
  }, []);

   /* error login */
       async function errorLogin(){
       
         return (
        <div>
         {/* <button className="submit" onClick={errorLogin}>errorLogin</button> */}
         <ToastContainer />
           </div>
        );
       }  

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    settoast("Login Error!");

    try {
      const authData = await pb.collection("users").authWithPassword(email, password);
      setUserId(authData.record.id);
      setCount(authData.record.count || 0);
      // fetchLeaderboard();
    } catch (err: any) {
      // setError("Invalid login credentials");
      errorLogin()
    } finally {
      setLoading(false);
    }
  }

     
  
  async function handleLogout() {
    pb.authStore.clear();
    setUserId("");
    setCount(0);
    setEmail("");
    setPassword("");
    setLeaderboardData([]);
  }

  async function handleClick() {
    const newValue = count + 1;
    setCount(newValue);

    if (newValue > 0 && newValue % 10 === 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }

    if (newValue === 100) {
      setCount(0); 
      await pb.collection("users").update(userId, { count: 0 });

    }else{
      await pb.collection("users").update(userId, { count: newValue });
    }

  }

  async function fetchLeaderboard() {
    try {
      const records = await pb.collection("leaderboard").getFullList<LeaderboardItem>();
      setLeaderboardData(records);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    }
  }
  

  // --- Not logged in? Show login form ---
  if (!userId) {
    return (
      <LoginForm 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        loading={loading}
        error={error}
      />
      
    );
  }

  // --- Logged in? Show app ---
  return (
    <>
      <div className="header">
        <h1 className="leaderboard-title">Clkr</h1>
      </div>

      
      <button className="logout-btn" onClick={handleLogout}>
        Logout       
      </button>

      <div className="card">
        <button onClick={handleClick} id="btn-main3d">
          {count}
        </button>
        {showConfetti && (
          <Confetti
            mode="boom"
            particleCount={50}
            colors={["#d0b400", "#a993027d"]}
          />
        )}
      </div>

      {leaderboardData.length > 0 ? (
        <table className="w-full text-left border-collapse">
          <thead className="leaderboard-title border-b-2 border-[#d0b400]">
            <tr>
              <th className="py-2 text-yellow-400 font-bold w-1/6">Rank</th>
              <th className="py-2">Player</th>
              <th className="py-2 text-right w-1/4">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((item, index) => (
              <tr
                key={item.id}
                className="leaderboard-item border-b border-dashed border-[#d0b400]/50 last:border-b-0"
              >
                <td className="py-1 text-yellow-400 font-bold text-center">
                  {index + 1}
                </td>
                <td className="py-1">{item.name}</td>
                <td className="py-1 text-right font-bold text-lg">
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="leaderboard-item text-center">Loading leaderboard...</p>
      )}
      
    </>
  );
}

export default App;
