import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import axiosInstanceGamification from "../../../axios/axiosInstanceGamification";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import ErrorPage from "../../error-page/ErrorPage";
import { Admin } from "../../../configurations/userRoles";
import "./leaderboard.styles.css";

function Leaderboard() {
	const { user_id, role } = useSelector((state) => state.user);
	const [leaderboardData, setLeaderboardData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [syncing, setSyncing] = useState(false);

	const fetchLeaderboard = async () => {
		try {
			setLoading(true);
			const response = await axiosInstanceGamification.get(
				"/gamified-learning/api/gamification/leaderboard"
			);

			if (response.data && response.data.success) {
				setLeaderboardData(response.data.leaderboard);
				setLoading(false);
			}
		} catch (error) {
			console.error("Error fetching leaderboard:", error);
			setError(true);
			setLoading(false);
			toast.error("Failed to load leaderboard data");
		}
	};

	const syncLeaderboard = async () => {
		try {
			setSyncing(true);
			const response = await axiosInstanceGamification.post(
				"/gamified-learning/api/gamification/leaderboard/sync"
			);

			if (response.data && response.data.success) {
				toast.success("Leaderboard synchronized successfully");
				fetchLeaderboard();
			}
		} catch (error) {
			console.error("Error syncing leaderboard:", error);
			toast.error("Failed to sync leaderboard");
		} finally {
			setSyncing(false);
		}
	};

	useEffect(() => {
		fetchLeaderboard();
	}, []);

	if (loading) return <LoadingScreen />;
	if (error) return <ErrorPage />;
	if (!leaderboardData) return <LoadingScreen />;

	return (
		<div className="leaderboard-container">
			<h1 className="leaderboard-title">Leaderboard</h1>
			<div className="leaderboard-description">
				<p>Top performers based on total score across all lessons</p>
			</div>

			{role === Admin && (
				<div className="admin-controls">
					<button
						className="sync-button"
						onClick={syncLeaderboard}
						disabled={syncing}
					>
						{syncing ? "Syncing..." : "Sync Leaderboard"}
					</button>
				</div>
			)}

			<div className="leaderboard-table">
				<div className="leaderboard-header">
					<div className="rank-column">Rank</div>
					<div className="user-column">User</div>
					<div className="score-column">Score</div>
					<div className="lessons-column">Lessons</div>
				</div>

				{leaderboardData.map((entry, index) => (
					<div
						key={entry.userId}
						className={`leaderboard-row ${
							entry.userId === user_id ? "current-user" : ""
						} ${index < 3 ? "top-three" : ""}`}
					>
						<div className="rank-column">
							{index === 0 && (
								<span className="rank-icon gold">🥇</span>
							)}
							{index === 1 && (
								<span className="rank-icon silver">🥈</span>
							)}
							{index === 2 && (
								<span className="rank-icon bronze">🥉</span>
							)}
							{index > 2 && (
								<span className="rank-number">{index + 1}</span>
							)}
						</div>
						<div className="user-column">
							<div className="user-avatar">
								{entry.profile_picture ? (
									<img
										src={entry.profile_picture}
										alt={entry.username || "User"}
									/>
								) : (
									<div className="default-avatar">
										{(entry.username ||
											"U")[0].toUpperCase()}
									</div>
								)}
							</div>
							<div className="username">
								{entry.username || `User ${index + 1}`}
							</div>
						</div>
						<div className="score-column">{entry.totalScore}</div>
						<div className="lessons-column">
							{entry.lessonCount}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default Leaderboard;
