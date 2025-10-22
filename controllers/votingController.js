const Contestant = require("../models/Contestant");
const Vote = require("../models/Vote");

// Get all active contestants with vote data
const getContestants = async (req, res) => {
  try {
    const contestants = await Contestant.find({ isActive: true })
      .sort({ votes: -1 })
      .lean();

    // Calculate total votes for percentage calculation
    const totalVotes = contestants.reduce(
      (sum, contestant) => sum + contestant.votes,
      0
    );

    // Add vote percentage to each contestant
    const contestantsWithPercentage = contestants.map((contestant) => ({
      ...contestant,
      votePercentage:
        totalVotes > 0 ? Math.round((contestant.votes / totalVotes) * 100) : 0,
    }));

    res.json({
      success: true,
      data: contestantsWithPercentage,
      totalVotes,
      totalContestants: contestants.length,
    });
  } catch (error) {
    console.error("Error fetching contestants:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contestants",
      error: error.message,
    });
  }
};

// Submit a vote
const submitVote = async (req, res) => {
  try {
    const { contestantId } = req.body;
    const voterIp =
      req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    if (!contestantId) {
      return res.status(400).json({
        success: false,
        message: "Contestant ID is required",
      });
    }

    // Check if contestant exists and is active
    const contestant = await Contestant.findById(contestantId);
    if (!contestant || !contestant.isActive) {
      return res.status(404).json({
        success: false,
        message: "Contestant not found or inactive",
      });
    }

    // Session-based voting: frontend controls voting restrictions using sessionStorage
    // Server accepts all votes (within rate limits) and doesn't check for duplicates
    // This allows users to vote again after closing/reopening their browser

    // Create vote record
    const dayKey = Vote.createDayKey(voterIp);
    const vote = new Vote({
      contestantId,
      voterIp,
      dayKey,
      userAgent: req.get("User-Agent") || "",
      source: "website",
    });

    await vote.save();

    // Increment contestant's vote count
    await contestant.incrementVotes();

    // Get updated contestant data
    const updatedContestant = await Contestant.findById(contestantId).lean();

    // Calculate new percentage with all contestants
    const allContestants = await Contestant.find({ isActive: true }).lean();
    const totalVotes = allContestants.reduce((sum, c) => sum + c.votes, 0);
    const votePercentage =
      totalVotes > 0
        ? Math.round((updatedContestant.votes / totalVotes) * 100)
        : 0;

    res.json({
      success: true,
      message: "Vote submitted successfully",
      data: {
        contestant: {
          ...updatedContestant,
          votePercentage,
        },
        contestantName: updatedContestant.name,
      },
    });

    // Emit real-time update to all connected clients
    req.app.get("io").emit("voteUpdate", {
      contestantId,
      newVoteCount: updatedContestant.votes,
      votePercentage,
      totalVotes,
    });
  } catch (error) {
    console.error("Error submitting vote:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit vote",
      error: error.message,
    });
  }
};

// Check if IP has voted today (kept for compatibility but not used in session-based voting)
const checkVotingStatus = async (req, res) => {
  try {
    // Since we're now using session-based voting, this endpoint is mainly for compatibility
    // The frontend handles voting status using sessionStorage
    res.json({
      success: true,
      data: {
        dailyVoteCount: 0,
        remainingVotes: 1,
        votedContestants: [],
        message:
          "Session-based voting is now active. Check frontend sessionStorage for voting status.",
      },
    });
  } catch (error) {
    console.error("Error checking voting status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check voting status",
      error: error.message,
    });
  }
};

// Get voting statistics
const getVotingStats = async (req, res) => {
  try {
    const totalVotes = await Vote.countDocuments({ isValid: true });
    const activeContestants = await Contestant.countDocuments({
      isActive: true,
    });

    // Get votes from last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentVotes = await Vote.countDocuments({
      voteDate: { $gte: last24Hours },
      isValid: true,
    });

    // Get top 3 contestants
    const topContestants = await Contestant.find({ isActive: true })
      .sort({ votes: -1 })
      .limit(3)
      .select("name votes _id")
      .lean();

    res.json({
      success: true,
      data: {
        totalVotes,
        activeContestants,
        recentVotes,
        topContestants,
      },
    });
  } catch (error) {
    console.error("Error fetching voting stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch voting statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getContestants,
  submitVote,
  checkVotingStatus,
  getVotingStats,
};
