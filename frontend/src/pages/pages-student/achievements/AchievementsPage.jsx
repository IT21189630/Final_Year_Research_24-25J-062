import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import "./achievements.css";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import ErrorPage from "../../error-page/ErrorPage";
import AchievementTile from "../../../components/achievement-tile/AchievementTile";
import axiosInstanceGamification from "../../../axios/axiosInstanceGamification";

function AchievementsPage() {
	const { user_id } = useSelector((state) => state.user);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [achievements, setAchievements] = useState({
		unlocked: [],
		locked: [],
		totalXp: 0,
	});
	const [achievementFilters, setAchievementFilters] = useState({
		rarity: "all",
		type: "all",
	});

	// Function to fetch user achievements
	const fetchUserAchievements = async () => {
		try {
			setLoading(true);
			console.log("Fetching achievements for user:", user_id);

			const response = await axiosInstanceGamification.get(
				`/gamified-learning/api/gamification/achievements/user/${user_id}`
			);

			if (response.data) {
				console.log("Achievement data received:", response.data);
				setAchievements({
					unlocked: response.data.unlocked || [],
					locked: response.data.locked || [],
					totalXp: response.data.totalXp || 0,
				});
			}
			setLoading(false);
		} catch (error) {
			console.error("Error fetching achievements:", error);
			setError(true);
			setLoading(false);
			toast.error("Failed to load achievements!");
		}
	};

	// Function to check for new achievements
	const checkForNewAchievements = async () => {
		try {
			setLoading(true);
			console.log("Checking for new achievements for user:", user_id);

			const response = await axiosInstanceGamification.post(
				`/gamified-learning/api/gamification/achievements/check/${user_id}`
			);

			if (response.data && response.data.success) {
				if (
					response.data.unlockedAchievements &&
					response.data.unlockedAchievements.length > 0
				) {
					toast.success(
						`You've unlocked ${response.data.unlockedAchievements.length} new achievements!`
					);
					// Refresh achievements after unlocking new ones
					fetchUserAchievements();
				} else {
					toast.info("No new achievements unlocked");
					setLoading(false);
				}
			}
		} catch (error) {
			console.error("Error checking achievements:", error);
			// toast.error("Failed to check for new achievements");
			toast("No new achievements", {
				icon: "⚠️",
				style: {
					background: "#FFFFFF",
					color: "#000000",
				},
			});
			setLoading(false);
		}
	};

	// Initialize achievements when first loading the page
	const initializeAchievements = async () => {
		try {
			console.log("Initializing achievements");
			await axiosInstanceGamification.post(
				`/gamified-learning/api/gamification/achievements/initialize`
			);
			console.log("Achievements initialized");
		} catch (error) {
			console.error("Error initializing achievements:", error);
		}
	};

	// Filter achievements based on selected filters
	const getFilteredAchievements = (achievementList) => {
		return achievementList.filter((achievement) => {
			const rarityMatch =
				achievementFilters.rarity === "all" ||
				achievement.achievementId?.rarity ===
					achievementFilters.rarity ||
				achievement.rarity === achievementFilters.rarity;
			const typeMatch =
				achievementFilters.type === "all" ||
				achievement.achievementId?.type === achievementFilters.type ||
				achievement.type === achievementFilters.type;
			return rarityMatch && typeMatch;
		});
	};

	// Group achievements by rarity
	const groupByRarity = (achievementList) => {
		const rarityOrder = ["legendary", "epic", "rare", "common"];
		const grouped = {};

		rarityOrder.forEach((rarity) => {
			const rarityAchievements = achievementList.filter((achievement) => {
				const achievementRarity =
					achievement.achievementId?.rarity || achievement.rarity;
				return achievementRarity === rarity;
			});
			if (rarityAchievements.length > 0) {
				grouped[rarity] = rarityAchievements;
			}
		});

		return grouped;
	};

	// Combine locked and unlocked achievements for display
	const combineAchievements = () => {
		// Create a map of all achievements by their ID
		const achievementsMap = new Map();

		// Add all locked achievements to the map
		filteredLocked.forEach((achievement) => {
			achievementsMap.set(achievement._id, {
				achievement,
				unlocked: false,
			});
		});

		// Update or add unlocked achievements to the map
		filteredUnlocked.forEach((achievement) => {
			const id = achievement.achievementId?._id || achievement._id;
			achievementsMap.set(id, {
				achievement: achievement.achievementId || achievement,
				unlocked: true,
			});
		});

		// Convert the map back to an array
		return Array.from(achievementsMap.values());
	};

	// Group combined achievements by rarity
	const groupAchievementsByRarity = (achievements) => {
		const rarityOrder = ["legendary", "epic", "rare", "common"];
		const grouped = {};

		rarityOrder.forEach((rarity) => {
			const rarityAchievements = achievements.filter((item) => {
				const achievement = item.achievement;
				return achievement.rarity === rarity;
			});

			if (rarityAchievements.length > 0) {
				grouped[rarity] = rarityAchievements;
			}
		});

		return grouped;
	};

	useEffect(() => {
		if (user_id) {
			initializeAchievements().then(() => {
				fetchUserAchievements();
			});
		}
	}, [user_id]);

	if (loading) return <LoadingScreen />;
	if (error) return <ErrorPage />;

	const filteredUnlocked = getFilteredAchievements(achievements.unlocked);
	const filteredLocked = getFilteredAchievements(achievements.locked);
	const groupedUnlocked = groupByRarity(filteredUnlocked);
	const groupedLocked = groupByRarity(filteredLocked);

	// Get combined achievements
	const combinedAchievements = combineAchievements();
	const groupedAchievements = groupAchievementsByRarity(combinedAchievements);

	// Calculate counts
	const unlockedCount = filteredUnlocked.length;
	const lockedCount = filteredLocked.length;
	const totalCount = unlockedCount + lockedCount;

	return (
		<div className="achievements-page-container">
			<div className="achievements-header">
				<div className="achievements-title-section">
					<h1 className="achievements-title">Achievements</h1>
					<div className="achievements-xp-counter">
						<span className="xp-label">Total XP:</span>
						<span className="xp-value">{achievements.totalXp}</span>
					</div>
				</div>

				<div className="achievements-controls">
					<div className="achievements-filters">
						<select
							value={achievementFilters.rarity}
							onChange={(e) =>
								setAchievementFilters({
									...achievementFilters,
									rarity: e.target.value,
								})
							}
							className="filter-select"
						>
							<option value="all">All Rarities</option>
							<option value="common">Common</option>
							<option value="rare">Rare</option>
							<option value="epic">Epic</option>
							<option value="legendary">Legendary</option>
						</select>

						<select
							value={achievementFilters.type}
							onChange={(e) =>
								setAchievementFilters({
									...achievementFilters,
									type: e.target.value,
								})
							}
							className="filter-select"
						>
							<option value="all">All Types</option>
							<option value="lesson_completion">Lessons</option>
							<option value="score_milestone">Score</option>
						</select>
					</div>

					<button
						className="refresh-achievements-btn"
						onClick={checkForNewAchievements}
					>
						Check for New Achievements
					</button>
				</div>
			</div>

			<div className="achievements-content">
				{totalCount > 0 ? (
					<>
						<div className="achievements-summary">
							<div className="achievements-progress">
								<div className="progress-label">
									<span>
										Progress: {unlockedCount}/{totalCount}{" "}
										Achievements Unlocked
									</span>
									<span className="progress-percentage">
										{totalCount > 0
											? Math.round(
													(unlockedCount /
														totalCount) *
														100
											  )
											: 0}
										%
									</span>
								</div>
								<div className="progress-bar-container">
									<div
										className="progress-bar"
										style={{
											width: `${
												totalCount > 0
													? (unlockedCount /
															totalCount) *
													  100
													: 0
											}%`,
										}}
									></div>
								</div>
							</div>
						</div>

						{Object.entries(groupedAchievements).map(
							([rarity, achievements]) => (
								<div
									key={rarity}
									className="achievements-section"
								>
									<h2
										className={`section-title rarity-${rarity}`}
									>
										{rarity.charAt(0).toUpperCase() +
											rarity.slice(1)}{" "}
										Achievements
									</h2>
									<div className="achievements-grid">
										{achievements.map((item) => (
											<AchievementTile
												key={item.achievement._id}
												achievement={item.achievement}
												unlocked={item.unlocked}
											/>
										))}
									</div>
								</div>
							)
						)}
					</>
				) : (
					<div className="no-achievements">
						<p>
							No achievements match your current filters. Try
							adjusting your filters.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default AchievementsPage;
