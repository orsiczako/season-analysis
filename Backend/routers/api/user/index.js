/**
 * USER API routes 
 */

const express = require('express');
const userController = require('../../../controllers/user.controller');
const { success, error } = require('../../../service/helpers/api-response.helper');
const asyncHandler = require('../../../service/middlewares/async-handler.middleware');
const { validateRequired, validateEmailTemplate } = require('../../../service/middlewares/request-validation.middleware');
const { authenticateToken } = require('../../../service/middlewares/auth.middleware');

module.exports = (User) => {
  const router = express.Router();

  // POST /login
  router.post('/login', 
    //Username és jelszó meg van adva?
    validateRequired('username', 'password'),
    // Aszinkron kezelő
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;
      
      // Bejelentkezési kísérlet
      const result = await userController.login(username, password);
      
      if (!result.success) {
        
        const msg = result.error === 'INVALID_CREDENTIALS' 
          ? 'Invalid username or password' 
          : 'Server error occurred';
        return error(res, msg, 401);
      }


      //Ha sikeres, akkor visszadja a user adatait, meg a jwt tokent, a user
      //ezt használja későbbi kéréseknél, így nem kell újra bejelentkeznie
      //az authenticateToken middleware ezt fogja ellenőrizni, enélkül nem enged be
      return success(res, 'Login successful', {
        redirect: '/dashboard',
        user: result.user,
        token: result.token
      });
    })
  );

  // POST /register
  router.post('/register',
    //Username, jelszó, email és teljes név meg van adva?
    validateRequired('username', 'password', 'email', 'fullName'),
    // Aszinkron kezelő
    asyncHandler(async (req, res) => {
      const { username, password, email, fullName } = req.body;
      
      try {
        const result = await userController.register({ username, password, email, fullName });
        
        return success(res, 'Registration successful', {
          user: result.user
        });
      } catch (err) {
        const msg = err.message === 'USERNAME_TAKEN' 
          ? 'Username already taken' 
          : 'Email already in use';
        return error(res, msg, 409);
      }
    })
  );

  // POST /forgot-password
  router.post('/forgot-password',
    //Email meg van adva?
    validateRequired('email'),

    validateEmailTemplate,
    asyncHandler(async (req, res) => {
      const { email, emailTemplate } = req.body;
      const result = await userController.forgotPassword(email, emailTemplate);
      
      if (!result.success && result.error === 'EMAIL_FAILED') {
        return error(res, 'Email sending failed', 500);
      }

      return success(res, 'Password recovery email sent');
    })
  );

  // POST /reset-password
  router.post('/reset-password',
    //Token és új jelszó meg van adva?
    validateRequired('token', 'password'),
    asyncHandler(async (req, res) => {
      const { token, password } = req.body;
      const result = await userController.resetPassword(token, password);
      
      if (!result.success) {
        const msg = result.error === 'INVALID_TOKEN' 
          ? 'Invalid or expired token' 
          : 'Token expired';
        return error(res, msg, 400);
      }

      return success(res, 'Password reset successful');
    })
  );

  // GET /me - Get current user profile
  router.get('/me',
    authenticateToken,
    asyncHandler(async (req, res) => {
      const result = await userController.getUserProfile(req.user.id);
      
      if (!result.success) {
        return error(res, 'User not found', 404);
      }

      return success(res, 'Profile retrieved', {
        user: result.user
      });
    })
  );

  // PUT /change-password - Change user password
  router.put('/change-password',
    authenticateToken,
    validateRequired('currentPassword', 'newPassword'),
    asyncHandler(async (req, res) => {
      const { currentPassword, newPassword } = req.body;
      
      if (newPassword.length < 6) {
        return error(res, 'Password too short (minimum 6 characters)', 400);
      }
      
      const result = await userController.changePassword(req.user.id, currentPassword, newPassword);
      
      if (!result.success) {
        const msg = result.error === 'INVALID_CURRENT_PASSWORD' 
          ? 'Current password is incorrect' 
          : 'Server error occurred';
        return error(res, msg, result.error === 'INVALID_CURRENT_PASSWORD' ? 400 : 500);
      }

      return success(res, 'Password changed successfully');
    })
  );

  // DELETE /delete-account - Delete user account
  router.delete('/delete-account',
    authenticateToken,
    asyncHandler(async (req, res) => {
      const result = await userController.deleteAccount(req.user.id);
      
      if (!result.success) {
        return error(res, 'Server error occurred', 500);
      }

      return success(res, 'Account deleted successfully');
    })
  );

  // PUT /color-season - Update user color season
  router.put('/color-season',
    authenticateToken,
    validateRequired('season'),
    asyncHandler(async (req, res) => {
      const { season } = req.body;
      
      const result = await userController.updateColorSeason(req.user.id, season);
      
      if (!result.success) {
        const msg = result.error === 'INVALID_SEASON' 
          ? 'Invalid season' 
          : 'Server error occurred';
        return error(res, msg, result.error === 'INVALID_SEASON' ? 400 : 500);
      }

      return success(res, 'Color season updated', {
        user: result.user
      });
    })
  );

  // GET /favorite-colors - Get user's favorite colors
  router.get('/favorite-colors',
    authenticateToken,
    asyncHandler(async (req, res) => {
      const result = await userController.getFavoriteColors(req.user.id);
      
      if (!result.success) {
        return error(res, 'Failed to get favorite colors', 500);
      }

      return success(res, 'Favorite colors retrieved', {
        favoriteColors: result.favoriteColors
      });
    })
  );

  // POST /favorite-colors - Add a favorite color
  router.post('/favorite-colors',
    authenticateToken,
    validateRequired('colorHex'),
    asyncHandler(async (req, res) => {
      const { colorHex } = req.body;
      
      const result = await userController.addFavoriteColor(req.user.id, colorHex);
      
      if (!result.success) {
        const msg = result.error === 'INVALID_HEX_COLOR' 
          ? 'Invalid hex color format' 
          : result.error === 'COLOR_ALREADY_EXISTS'
          ? 'Color already in favorites'
          : 'Server error occurred';
        const statusCode = result.error === 'COLOR_ALREADY_EXISTS' ? 409 : 400;
        return error(res, msg, statusCode);
      }

      return success(res, 'Favorite color added', {
        favoriteColors: result.favoriteColors
      });
    })
  );

  // DELETE /favorite-colors/:colorHex - Remove a favorite color
  router.delete('/favorite-colors/:colorHex',
    authenticateToken,
    asyncHandler(async (req, res) => {
      const { colorHex } = req.params;
      
      // URL decode the color hex (in case it contains # symbol)
      const decodedColorHex = decodeURIComponent(colorHex);
      
      const result = await userController.removeFavoriteColor(req.user.id, decodedColorHex);
      
      if (!result.success) {
        return error(res, 'Failed to remove favorite color', 500);
      }

      return success(res, 'Favorite color removed', {
        favoriteColors: result.favoriteColors
      });
    })
  );

  return router;
};
