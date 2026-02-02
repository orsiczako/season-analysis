/**
 * User Controller - Function-based
 */

const userService = require('../service/business/user.service');
const dbModels = require('../dbo');

const { User, ColorSeason } = dbModels;

// Helper function to format user with season info
function formatUserWithSeason(user) {
  const formatted = {
    id: user.account_id,
    username: user.login_name,
    email: user.email_address,
    fullName: user.full_name,
    colorSeason: user.colorSeason ? user.colorSeason.season_name : null,
    colorAnalysisDate: user.color_analysis_date
  };
  return formatted;
}

// Egyszerű átmenő függvények - a middleware már validált
const login = (username, password) => userService.login(username, password);
const register = (userData) => userService.register(userData);
const forgotPassword = (email, emailTemplate) => userService.forgotPassword(email, emailTemplate);
const resetPassword = (token, newPassword) => userService.resetPassword(token, newPassword);

async function getUserProfile(userId) {
  const user = await User.findOne({
    where: { account_id: userId },
    include: [
      { model: ColorSeason, as: 'colorSeason' }
    ]
  });

  if (!user) {
    return { success: false, error: 'USER_NOT_FOUND' };
  }


  const formatted = userService.formatUser(user);

  return {
    success: true,
    user: formatted
  };
}

async function changePassword(userId, currentPassword, newPassword) {
  // A middleware+router már validálta
  return await userService.changePassword(userId, currentPassword, newPassword);
}

async function deleteAccount(userId) {

  if (!userId) {
    return { success: false, error: 'MISSING_USER_ID' };
  }

  try {
    const user = await User.findOne({ where: { account_id: userId } });
    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }

    await user.destroy();
    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    if (error && error.stack) {
      console.error(error.stack);
    }
    return { success: false, error: error.message || 'DELETE_FAILED' };
  }
}

async function updateColorSeason(userId, season) {

  if (!userId || !season) {
    return { success: false, error: 'MISSING_REQUIRED_FIELDS' };
  }

  const validSeasons = ['spring', 'summer', 'autumn', 'winter'];
  if (!validSeasons.includes(season)) {
    return { success: false, error: 'INVALID_SEASON' };
  }

  const user = await User.findOne({ where: { account_id: userId } });

  if (!user) {
    return { success: false, error: 'USER_NOT_FOUND' };
  }

  // Megkeressük a color_season rekordot a season név alapján
  const colorSeason = await ColorSeason.findOne({ where: { season_name: season } });

  if (!colorSeason) {
    return { success: false, error: 'SEASON_NOT_FOUND' };
  }

  try {
    await user.update({
      color_season_id: colorSeason.season_id,
      color_analysis_date: new Date()
    });

    // Újratöltjük a usert az asszociációval együtt
    const updatedUser = await User.findOne({
      where: { account_id: userId },
      include: [{ model: ColorSeason, as: 'colorSeason' }]
    });

    return {
      success: true,
      user: formatUserWithSeason(updatedUser)
    };
  } catch (error) {
    console.error('Error updating color season:', error);
    return { success: false, error: 'UPDATE_FAILED' };
  }
}

async function getAnalysesResults(userId) {
  const { SkinAnalysis } = dbModels;

  const user = await User.findOne({
    where: { account_id: userId },
    include: [{ model: ColorSeason, as: 'colorSeason' }]
  });

  if (!user) {
    return { success: false, error: 'USER_NOT_FOUND' };
  }

  // Get latest skin analysis
  const skinAnalysis = await SkinAnalysis.findOne({
    where: { account_id: userId },
    order: [['created_at', 'DESC']]
  });

  let skinAnalysisData = null;
  let protocolData = null;
  let problemsProtocolData = null;

  if (skinAnalysis) {
    // Parse skin_problems - lehet JSON string vagy array
    let skinProblems = skinAnalysis.skin_problems || [];
    if (typeof skinProblems === 'string') {
      try {
        skinProblems = JSON.parse(skinProblems);
      } catch (e) {
        skinProblems = [];
      }
    }

    skinAnalysisData = {
      id: skinAnalysis.analysis_id,
      skinType: skinAnalysis.skin_type,
      skinProblems: skinProblems,
      analyzedAt: skinAnalysis.created_at
    };

    // Try to load protocol for skin type
    try {
      const skinAnalysisService = require('../service/ai/skin-analysis.service');
      const protocolRes = await skinAnalysisService.getSkinProtocol(skinAnalysis.skin_type);
      if (protocolRes.success) {
        protocolData = protocolRes.data;
      }

      // Load skin problems protocols if there are detected problems
      if (skinProblems && skinProblems.length > 0) {
        const problemsForProtocol = skinProblems.map(p => ({ problem: p }));
        const problemsRes = await skinAnalysisService.getSkinProblemsProtocol(problemsForProtocol);
        if (problemsRes.success) {
          problemsProtocolData = problemsRes.data;
        }
      }
    } catch (err) {
      console.error('Failed to load skin protocol:', err);
    }
  }

  return {
    success: true,
    data: {
      colorSeason: user.colorSeason ? {
        id: user.colorSeason.season_id,
        name: user.colorSeason.season_name,
        displayName: user.colorSeason.season_display_name
      } : null,
      skinAnalysis: skinAnalysisData,
      protocol: protocolData,
      problemsProtocol: problemsProtocolData
    }
  };
}

/**
 * Profil frissítése: teljes név, felhasználónév, email
 */
async function updateProfile(userId, { fullName, username, email }) {
  if (!userId) {
    return { success: false, message: 'USER_ID_REQUIRED' };
  }
  if (!fullName && !username && !email) {
    return { success: false, message: 'NO_FIELDS_TO_UPDATE' };
  }

  const user = await User.findOne({ where: { account_id: userId } });
  if (!user) {
    return { success: false, message: 'USER_NOT_FOUND' };
  }

  // Only update provided fields
  const updateData = {};
  if (fullName) updateData.full_name = fullName;
  if (username) updateData.login_name = username;
  if (email) updateData.email_address = email;

  try {
    await user.update(updateData);
    // Frissített user visszaadása
    return { success: true, user: formatUserWithSeason(user) };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, message: 'UPDATE_FAILED' };
  }
}

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  getUserProfile,
  changePassword,
  deleteAccount,
  updateColorSeason,
  getAnalysesResults,
  updateProfile
};