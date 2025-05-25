import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import "./coins.css";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import ErrorPage from "../../error-page/ErrorPage";
import axiosInstanceGamification from "../../../axios/axiosInstanceGamification";
import {
	FaCoins,
	FaTrophy,
	FaExchangeAlt,
	FaLightbulb,
	FaBook,
	FaRocket,
	FaPalette,
	FaGift,
	FaCrown,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

function CoinsPage() {
	const { user_id } = useSelector((state) => state.user);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [wallet, setWallet] = useState(null);
	const [totalXp, setTotalXp] = useState(0);
	const [conversionRates, setConversionRates] = useState([]);
	const [selectedConversion, setSelectedConversion] = useState(null);
	const [customXpAmount, setCustomXpAmount] = useState("");
	const [convertingXp, setConvertingXp] = useState(false);
	const [purchasingItemId, setPurchasingItemId] = useState(null);

	// Fetch wallet data
	const fetchWallet = async () => {
		try {
			setLoading(true);
			console.log("Fetching wallet for user:", user_id);

			const response = await axiosInstanceGamification.get(
				`/gamified-learning/api/gamification/wallet/${user_id}`
			);

			if (response.data.success) {
				console.log("Wallet data received:", response.data);
				setWallet(response.data.wallet);
				setTotalXp(response.data.totalXp);
			}
			setLoading(false);
		} catch (error) {
			console.error("Error fetching wallet:", error);
			setError(true);
			setLoading(false);
			toast.error("Failed to load wallet!");
		}
	};

	// Fetch conversion rates
	const fetchConversionRates = async () => {
		try {
			const response = await axiosInstanceGamification.get(
				"/gamified-learning/api/gamification/wallet/conversion-rates"
			);

			if (response.data.success) {
				console.log("Conversion rates received:", response.data);
				setConversionRates(response.data.conversionRates);
			}
		} catch (error) {
			console.error("Error fetching conversion rates:", error);
			toast.error("Failed to load conversion rates!");
		}
	};

	// Convert XP to coins
	const handleConvertXp = async () => {
		let xpAmount = 0;

		if (selectedConversion === "custom") {
			xpAmount = parseInt(customXpAmount, 10);
			if (isNaN(xpAmount) || xpAmount <= 0) {
				toast.error("Please enter a valid XP amount");
				return;
			}
		} else if (selectedConversion) {
			xpAmount = parseInt(selectedConversion, 10);
		} else {
			toast.error("Please select an amount to convert");
			return;
		}

		// Check if user has enough XP
		if (xpAmount > totalXp) {
			toast.error("You don't have enough XP for this conversion");
			return;
		}

		try {
			setConvertingXp(true);
			const response = await axiosInstanceGamification.post(
				"/gamified-learning/api/gamification/wallet/convert",
				{
					userId: user_id,
					xpAmount,
				}
			);

			if (response.data.success) {
				toast.success(
					`Successfully converted ${xpAmount} XP to ${response.data.conversion.coinsAwarded} coins!`
				);
				// Refresh wallet data
				fetchWallet();
				// Reset selection
				setSelectedConversion(null);
				setCustomXpAmount("");
			}
		} catch (error) {
			console.error("Error converting XP:", error);
			toast.error(
				error.response?.data?.error || "Failed to convert XP to coins!"
			);
		} finally {
			setConvertingXp(false);
		}
	};

	// Handle item purchase - Updated to track specific item being purchased
	const handlePurchase = async (itemId, itemName, price, icon) => {
		// Check if user has enough coins
		if (wallet?.coinBalance < price) {
			toast.error(
				"Not enough coins! Complete more lessons to earn XP and convert to coins."
			);
			return;
		}

		try {
			setPurchasingItemId(itemId);
			const response = await axiosInstanceGamification.post(
				"/gamified-learning/api/gamification/store/purchase",
				{
					userId: user_id,
					itemId,
				}
			);

			if (response.data.success) {
				toast.success(`${itemName} purchased successfully!`, {
					icon: icon,
				});
				// Refresh wallet data to show updated balance and transactions
				fetchWallet();
			}
		} catch (error) {
			console.error("Error purchasing item:", error);
			toast.error(
				error.response?.data?.error || "Failed to purchase item!"
			);
		} finally {
			setPurchasingItemId(null);
		}
	};

	useEffect(() => {
		if (user_id) {
			fetchWallet();
			fetchConversionRates();
		}
	}, [user_id]);

	if (loading) return <LoadingScreen />;
	if (error) return <ErrorPage />;

	return (
		<div className="coins-page-container">
			<div className="coins-header">
				<div className="coins-title-section">
					<h1 className="coins-title">Coins</h1>
					<div className="coins-subtitle">
						Exchange your XP for valuable coins!
					</div>
				</div>
			</div>

			<div className="coins-content">
				<div className="wallet-overview">
					<div className="balance-card coin-balance">
						<FaCoins className="balance-icon" />
						<div className="balance-details">
							<div className="balance-label">Coin Balance</div>
							<div className="balance-value">
								{wallet?.coinBalance || 0}
							</div>
						</div>
					</div>

					<div className="balance-card xp-balance">
						<FaTrophy className="balance-icon" />
						<div className="balance-details">
							<div className="balance-label">XP Balance</div>
							<div className="balance-value">{totalXp}</div>
						</div>
					</div>
				</div>

				<div className="conversion-section">
					<h2 className="section-title">Convert XP to Coins</h2>
					<div className="conversion-rates">
						{conversionRates.map((rate) => (
							<div
								key={rate.xp}
								className={`rate-card ${
									selectedConversion === rate.xp.toString()
										? "selected"
										: ""
								} ${totalXp < rate.xp ? "disabled" : ""}`}
								onClick={() =>
									totalXp >= rate.xp &&
									setSelectedConversion(rate.xp.toString())
								}
							>
								<div className="rate-name">{rate.name}</div>
								<div className="rate-value">
									{rate.xp} XP → {rate.coins} Coins
								</div>
								<div className="rate-efficiency">
									Efficiency:{" "}
									{((rate.coins / rate.xp) * 100).toFixed(2)}%
								</div>
							</div>
						))}
						<div
							className={`rate-card custom ${
								selectedConversion === "custom"
									? "selected"
									: ""
							}`}
							onClick={() => setSelectedConversion("custom")}
						>
							<div className="rate-name">Custom Amount</div>
							<div className="custom-input">
								<input
									type="number"
									placeholder="Enter XP amount"
									value={customXpAmount}
									onChange={(e) =>
										setCustomXpAmount(e.target.value)
									}
									onClick={(e) => e.stopPropagation()}
								/>
							</div>
							<div className="rate-note">
								Uses the best available rate
							</div>
						</div>
					</div>

					<button
						className="convert-button"
						onClick={handleConvertXp}
						disabled={
							!selectedConversion ||
							convertingXp ||
							(selectedConversion === "custom" &&
								(!customXpAmount ||
									parseInt(customXpAmount, 10) <= 0))
						}
					>
						{convertingXp ? "Converting..." : "Convert XP to Coins"}{" "}
						<FaExchangeAlt />
					</button>
				</div>

				<div className="transaction-section">
					<h2 className="section-title">Transaction History</h2>
					{wallet && wallet.transactions.length > 0 ? (
						<div className="transaction-list">
							{wallet.transactions
								.slice()
								.reverse()
								.map((transaction, index) => (
									<div
										key={index}
										className="transaction-item"
									>
										<div className="transaction-icon">
											{transaction.type ===
											"CONVERT_XP" ? (
												<FaExchangeAlt />
											) : transaction.type ===
											  "PURCHASE" ? (
												<FaCoins />
											) : (
												<FaTrophy />
											)}
										</div>
										<div className="transaction-details">
											<div className="transaction-description">
												{transaction.description}
											</div>
											<div className="transaction-time">
												{formatDistanceToNow(
													new Date(
														transaction.timestamp
													),
													{ addSuffix: true }
												)}
											</div>
										</div>
										<div className="transaction-amount">
											{transaction.coinAmount > 0
												? "+"
												: ""}
											{transaction.coinAmount} coins
										</div>
									</div>
								))}
						</div>
					) : (
						<div className="no-transactions">
							No transactions yet
						</div>
					)}
				</div>

				<div className="store-section">
					<h2 className="section-title">Game Store</h2>
					<p className="store-description">
						Spend your hard-earned coins on various items to enhance
						your learning experience!
					</p>

					<div className="store-items">
						{/* Updated: 5 Lesson Hints for 2 coins */}
						<div className="store-item">
							<div className="store-item-icon">
								<FaLightbulb />
							</div>
							<div className="store-item-details">
								<h3>5 JS Lesson Hints</h3>
								<p>Get 5 extra hints for JavaScript lessons</p>
							</div>
							<div className="store-item-price">
								<span>
									2 <FaCoins className="coin-icon" />
								</span>
								<button
									className="buy-button"
									onClick={() =>
										handlePurchase(
											"5_lesson_hints",
											"5 JS Lesson Hints",
											2,
											"💡"
										)
									}
									disabled={
										purchasingItemId === "5_lesson_hints"
									}
								>
									{purchasingItemId === "5_lesson_hints"
										? "Buying..."
										: "Buy"}
								</button>
							</div>
						</div>

						<div className="store-item">
							<div className="store-item-icon">
								<FaBook />
							</div>
							<div className="store-item-details">
								<h3>Advanced Tutorial</h3>
								<p>Access premium learning material</p>
							</div>
							<div className="store-item-price">
								<span>
									5 <FaCoins className="coin-icon" />
								</span>
								<button
									className="buy-button"
									onClick={() =>
										handlePurchase(
											"advanced_tutorial",
											"Advanced Tutorial",
											5,
											"📚"
										)
									}
									disabled={
										purchasingItemId === "advanced_tutorial"
									}
								>
									{purchasingItemId === "advanced_tutorial"
										? "Buying..."
										: "Buy"}
								</button>
							</div>
						</div>

						<div className="store-item">
							<div className="store-item-icon">
								<FaRocket />
							</div>
							<div className="store-item-details">
								<h3>2× XP Booster (1 day)</h3>
								<p>Double your XP earnings for 24 hours</p>
							</div>
							<div className="store-item-price">
								<span>
									10 <FaCoins className="coin-icon" />
								</span>
								<button
									className="buy-button"
									onClick={() =>
										handlePurchase(
											"xp_booster",
											"2× XP Booster (1 day)",
											10,
											"🚀"
										)
									}
									disabled={purchasingItemId === "xp_booster"}
								>
									{purchasingItemId === "xp_booster"
										? "Buying..."
										: "Buy"}
								</button>
							</div>
						</div>

						<div className="store-item">
							<div className="store-item-icon">
								<FaPalette />
							</div>
							<div className="store-item-details">
								<h3>Custom Theme</h3>
								<p>Personalize your learning environment</p>
							</div>
							<div className="store-item-price">
								<span>
									15 <FaCoins className="coin-icon" />
								</span>
								<button
									className="buy-button"
									onClick={() =>
										handlePurchase(
											"custom_theme",
											"Custom Theme",
											15,
											"🎨"
										)
									}
									disabled={
										purchasingItemId === "custom_theme"
									}
								>
									{purchasingItemId === "custom_theme"
										? "Buying..."
										: "Buy"}
								</button>
							</div>
						</div>

						<div className="store-item">
							<div className="store-item-icon">
								<FaCrown />
							</div>
							<div className="store-item-details">
								<h3>Exclusive Avatar</h3>
								<p>
									Stand out on the leaderboard with a special
									profile picture
								</p>
							</div>
							<div className="store-item-price">
								<span>
									25 <FaCoins className="coin-icon" />
								</span>
								<button
									className="buy-button"
									onClick={() =>
										handlePurchase(
											"exclusive_avatar",
											"Exclusive Avatar",
											25,
											"👑"
										)
									}
									disabled={
										purchasingItemId === "exclusive_avatar"
									}
								>
									{purchasingItemId === "exclusive_avatar"
										? "Buying..."
										: "Buy"}
								</button>
							</div>
						</div>

						<div className="store-item">
							<div className="store-item-icon">
								<FaGift />
							</div>
							<div className="store-item-details">
								<h3>Mystery Box</h3>
								<p>Contains a random reward of varying value</p>
							</div>
							<div className="store-item-price">
								<span>
									8 <FaCoins className="coin-icon" />
								</span>
								<button
									className="buy-button"
									onClick={() =>
										handlePurchase(
											"mystery_box",
											"Mystery Box",
											8,
											"🎁"
										)
									}
									disabled={
										purchasingItemId === "mystery_box"
									}
								>
									{purchasingItemId === "mystery_box"
										? "Buying..."
										: "Buy"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CoinsPage;
