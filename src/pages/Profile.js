import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import "../styles/Profile.css";

// Static terpene metadata to enrich the Taste Profile panel.
const TERPENE_META = {
	Myrcene: { aroma: "Earthy, Musky", effect: "Relaxing, Sedative" },
	Limonene: { aroma: "Citrus, Zesty", effect: "Uplifting, Mood Boost" },
	Caryophyllene: { aroma: "Spicy, Peppery", effect: "Anti-inflammatory, Balanced" },
};

// Standard list of US states for the profile form.
const US_STATES = [
	"Alabama",
	"Alaska",
	"Arizona",
	"Arkansas",
	"California",
	"Colorado",
	"Connecticut",
	"Delaware",
	"Florida",
	"Georgia",
	"Hawaii",
	"Idaho",
	"Illinois",
	"Indiana",
	"Iowa",
	"Kansas",
	"Kentucky",
	"Louisiana",
	"Maine",
	"Maryland",
	"Massachusetts",
	"Michigan",
	"Minnesota",
	"Mississippi",
	"Missouri",
	"Montana",
	"Nebraska",
	"Nevada",
	"New Hampshire",
	"New Jersey",
	"New Mexico",
	"New York",
	"North Carolina",
	"North Dakota",
	"Ohio",
	"Oklahoma",
	"Oregon",
	"Pennsylvania",
	"Rhode Island",
	"South Carolina",
	"South Dakota",
	"Tennessee",
	"Texas",
	"Utah",
	"Vermont",
	"Virginia",
	"Washington",
	"West Virginia",
	"Wisconsin",
	"Wyoming",
];

const ProfilePage = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [stashLoading, setStashLoading] = useState(false);
	const [stash, setStash] = useState([]);
	const [profile, setProfile] = useState({
		email: "",
		dob: "",
		city: "",
		state: "",
		zip_code: "",
		bio: "",
		is_verified_21: 0,
		display_name: "",
	});

	// Build a sorted frequency map of primary terpenes in the stash.
	const terpeneProfile = useMemo(() => {
		if (!Array.isArray(stash)) return [];
		const counts = {};
		stash.forEach((strain) => {
			const terp = strain?.primary_terpene || "Unknown";
			counts[terp] = (counts[terp] || 0) + 1;
		});
		return Object.entries(counts).sort((a, b) => b[1] - a[1]);
	}, [stash]);

	// Display-friendly account creation date sourced from Firebase metadata.
	const memberSince = useMemo(() => {
		const created = user?.metadata?.creationTime;
		if (!created) return "—";
		const date = new Date(created);
		return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
	}, [user]);

	// Lightweight gamification based on stash size.
	const gardenLevel = useMemo(() => {
		const count = Array.isArray(stash) ? stash.length : 0;
		if (count >= 20) return "Master Grower";
		if (count >= 10) return "Cultivator";
		if (count >= 5) return "Enthusiast";
		if (count >= 1) return "Sprout";
		return "New Seedling";
	}, [stash]);

	// Determine whether Indica/Sativa/Hybrid is most favored.
	const favoriteType = useMemo(() => {
		if (!Array.isArray(stash) || stash.length === 0) return "—";
		const counts = stash.reduce((acc, strain) => {
			const key = (strain?.type || "Unknown").toLowerCase();
			acc[key] = (acc[key] || 0) + 1;
			return acc;
		}, {});
		const [top] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
		return top?.[0] ? top[0].charAt(0).toUpperCase() + top[0].slice(1) : "—";
	}, [stash]);

	// Top terpene by count for quick display.
	const dominantTerpene = useMemo(() => terpeneProfile[0]?.[0] || "—", [terpeneProfile]);

	// Fallback chain for display name: DB -> Firebase -> email prefix.
	const displayName =
		profile.display_name || user?.displayName || profile.email?.split("@")[0] || "Member";

	// Fetch profile details from the backend using the Firebase ID token.
	useEffect(() => {
		const getProfile = async () => {
			try {
				const token = await user.getIdToken();
				const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setProfile(res.data || {});
			} catch (err) {
				console.error("Fetch error:", err);
			} finally {
				setLoading(false);
			}
		};
		if (user) getProfile();
	}, [user]);

	// Load the user's saved strains (stash) with backend join data.
	useEffect(() => {
		const loadStash = async () => {
			if (!user) return;
			setStashLoading(true);
			try {
				const token = await user.getIdToken();
				const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/favorites/my-stash`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = res.data;
				setStash(Array.isArray(data) ? data : []);
			} catch (err) {
				console.error("Stash fetch error:", err);
				setStash([]);
			} finally {
				setStashLoading(false);
			}
		};
		loadStash();
	}, [user]);

	// Persist profile edits back to the backend.
	const handleUpdate = async (e) => {
		e.preventDefault();
		try {
			const token = await user.getIdToken();
			await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/profile`, profile, {
				headers: { Authorization: `Bearer ${token}` },
			});
			alert("✅ Profile Updated!");
		} catch (err) {
			alert("❌ Error saving profile.");
		}
	};

	if (loading) return <div className="profile-wrapper">Loading...</div>;

	return (
		<div className="profile-wrapper">
			<div className="profile-grid">
				<section className="profile-card profile-header-card">
					<div className="avatar-block">
						<div className="avatar-circle">{displayName.charAt(0).toUpperCase()}</div>
						<div>
							<h2 className="profile-name">{displayName}</h2>
							<div className="profile-meta-row">
								<span className="meta-chip">Member since {memberSince}</span>
								<span className="meta-chip">Garden Level: {gardenLevel}</span>
							</div>
						</div>
					</div>
					{profile.is_verified_21 === 1 && (
						<div className="verified-badge">✅ Verified 21+ Member</div>
					)}

					<div className="read-only-info">
						<p>
							<strong>Account Email:</strong> {profile.email}
						</p>
						<p>
							<strong>Verified Birthday:</strong>{" "}
							{profile.dob ? new Date(profile.dob).toLocaleDateString() : "Add your birthday"}
						</p>
						<p>
							<strong>Location:</strong>{" "}
							{[profile.city, profile.state].filter(Boolean).join(", ") || "Add your city/state"}
						</p>
					</div>

					<div className="bio-card">
						<h4>About</h4>
						<p>{profile.bio || "Share a bit about your preferences, favorite strains, and goals."}</p>
					</div>
				</section>

				<section className="profile-card profile-stash-card">
					<div className="section-header">
						<h3>🌿 My Stash</h3>
						<span className="section-pill">{stash.length} saved</span>
					</div>
					{stashLoading ? (
						<div>Loading stash...</div>
					) : (
						<div className="stash-grid">
							{stash.length === 0 ? (
								<p className="stash-empty">No favorites yet.</p>
							) : (
								stash.map((strain) => (
									<div key={strain.id} className="mini-strain-card">
										<span className={`dot ${strain.type?.toLowerCase()}`}></span>
										<div className="mini-strain-info">
											<strong>{strain.name}</strong>
											<span className="mini-strain-sub">
												{strain.type || "—"} · {strain.primary_terpene || "Unknown terpene"}
											</span>
										</div>
									</div>
								))
							)}
						</div>
					)}
				</section>

				<section className="profile-card profile-taste-card">
					<div className="section-header">
						<h3>🧬 Taste Profile</h3>
						<span className="section-pill">Top 3 Terpenes</span>
					</div>

					{stash.length === 0 ? (
						<p className="stash-empty">Add strains to see your terpene breakdown.</p>
					) : (
						<>
							<div className="terpene-list">
								{terpeneProfile.map(([terpene, count]) => {
									const max = terpeneProfile[0]?.[1] || 1;
									const width = Math.round((count / max) * 100);
									return (
										<div key={terpene} className="terpene-row">
											<span className="terpene-name">{terpene}</span>
											<div className="terpene-bar">
												<div className="terpene-fill" style={{ width: `${width}%` }} />
											</div>
											<span className="terpene-count">{count}</span>
										</div>
									);
								})}
							</div>

							<div className="terpene-toplist">
								{terpeneProfile.slice(0, 3).map(([terpene, count]) => {
									const meta = TERPENE_META[terpene] || { aroma: "Unknown", effect: "Unknown" };
									return (
										<div key={terpene} className="terpene-top-item">
											<div className="terpene-top-name">
												{terpene} <span className="terpene-top-count">({count})</span>
											</div>
											<div className="terpene-top-meta">
												Aroma: {meta.aroma} · Typical Effect: {meta.effect}
											</div>
										</div>
									);
								})}
							</div>

							<div className="profile-stats">
								<div className="stat-card">
									<span className="stat-label">Dominant Terpene</span>
									<span className="stat-value">{dominantTerpene}</span>
								</div>
								<div className="stat-card">
									<span className="stat-label">Most Loved Type</span>
									<span className="stat-value">{favoriteType}</span>
								</div>
								<div className="stat-card">
									<span className="stat-label">Total Favorites</span>
									<span className="stat-value">{stash.length}</span>
								</div>
							</div>
						</>
					)}
				</section>

				<section className="profile-card profile-form-card">
					<div className="section-header">
						<h3>📝 Edit Profile</h3>
						<span className="section-pill">Keep details fresh</span>
					</div>
					<form className="profile-form" onSubmit={handleUpdate}>
						<label className="form-label">
							City
							<input
								id="profile-city"
								name="city"
								type="text"
								value={profile.city || ""}
								onChange={(e) => setProfile({ ...profile, city: e.target.value })}
								placeholder="City"
							/>
						</label>

						<label className="form-label">
							State
							<select
								id="profile-state"
								name="state"
								value={profile.state || ""}
								onChange={(e) => setProfile({ ...profile, state: e.target.value })}
							>
								<option value="">Select state</option>
								{US_STATES.map((st) => (
									<option key={st} value={st}>
										{st}
									</option>
								))}
							</select>
						</label>

						<label className="form-label">
							Zip Code
							<input
								id="profile-zip"
								name="zip_code"
								type="text"
								value={profile.zip_code || ""}
								onChange={(e) => setProfile({ ...profile, zip_code: e.target.value })}
								placeholder="Zip"
							/>
						</label>

						<label className="form-label">
							Bio
							<textarea
								id="profile-bio"
								name="bio"
								rows={3}
								value={profile.bio || ""}
								onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
								placeholder="Share your preferences, goals, or favorite strains"
							/>
						</label>

						<button className="primary-btn" type="submit">
							Save Changes
						</button>
					</form>
				</section>
			</div>
		</div>
	);
};

export default ProfilePage;
