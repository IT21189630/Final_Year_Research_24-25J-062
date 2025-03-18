import React from "react";
import "./achievement-tile.css";
import { FaTrophy, FaLock } from "react-icons/fa";

// Achievement rarity colors
const rarityColors = {
	common: "#3498db", // Blue
	rare: "#9b59b6", // Purple
	epic: "#f39c12", // Orange
	legendary: "#e74c3c", // Red
};

function AchievementTile({ achievement, unlocked }) {
	const { name, description, xpReward, icon, rarity, visibility } =
		achievement;

	// Determine tile styling based on rarity and unlock status
	const getTileStyle = () => {
		const baseStyle = {
			borderColor: rarityColors[rarity] || "#3498db",
		};

		if (!unlocked) {
			return {
				...baseStyle,
				opacity: visibility === "partially_hidden" ? 0.7 : 1,
			};
		}

		return {
			...baseStyle,
			boxShadow: `0 0 10px ${rarityColors[rarity] || "#3498db"}`,
		};
	};

	return (
		<div
			className={`achievement-tile ${rarity} ${
				unlocked ? "unlocked" : "locked"
			}`}
			style={getTileStyle()}
		>
			<div className="achievement-icon-container">
				{unlocked ? (
					<img
						src={`/images/achievements/${icon}`}
						alt={name}
						onError={(e) => {
							// Fallback to trophy icon if image fails to load
							e.target.style.display = "none";
							e.target.parentNode.classList.add("fallback-icon");
						}}
						className="achievement-icon"
					/>
				) : (
					<>
						<div className="lock-overlay">
							<FaLock className="lock-icon" />
						</div>
						{visibility !== "hidden" && (
							<img
								src={`/images/achievements/${icon}`}
								alt={name}
								onError={(e) => {
									e.target.style.display = "none";
									e.target.parentNode.classList.add(
										"fallback-icon"
									);
								}}
								className="achievement-icon locked-icon"
							/>
						)}
					</>
				)}
				{/* Fallback if image fails to load */}
				<FaTrophy className="trophy-icon" />
			</div>

			<div className="achievement-details">
				<h3 className="achievement-name">
					{unlocked || visibility !== "hidden" ? name : "???"}
				</h3>
				<p className="achievement-description">
					{unlocked || visibility !== "hidden"
						? description
						: "This achievement is still a mystery..."}
				</p>
				<div className="achievement-reward">
					<span className="xp-reward">+{xpReward} XP</span>
					<span className={`rarity-badge ${rarity}`}>{rarity}</span>
				</div>
			</div>

			{/* Add a prominent lock icon overlay on the entire tile */}
			{!unlocked && (
				<div className="locked-achievement-icon">
					<FaLock className="locked-tile-lock-icon" />
				</div>
			)}
		</div>
	);
}

export default AchievementTile;
