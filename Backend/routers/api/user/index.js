
const express = require('express');
const userController = require('../../../controllers/user.controller');
const { success, error } = require('../../../service/helpers/api-response.helper');
const { asyncHandler, authenticateToken, validateRequired, validateEmailTemplate } = require('../../../service/middlewares');

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
        // A hibakódot errorCode mezőben visszaadjuk
        return error(res, '', 401, result.error || 'INVALID_CREDENTIALS');
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
  router.put('/profile',
    authenticateToken,
    asyncHandler(async (req, res) => {
      const { fullName, username, email } = req.body;
      const result = await userController.updateProfile(req.user.id, { fullName, username, email });
      if (!result.success) {
        return error(res, '', 400, result.message || 'UPDATE_FAILED');
      }
      return success(res, 'Profil frissítve', { user: result.user });
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
        const errorCode = err.message === 'USERNAME_TAKEN' ? 'USERNAME_TAKEN' : 'EMAIL_TAKEN';
        return error(res, '', 409, errorCode);
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
        return error(res, '', 500, 'EMAIL_FAILED');
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
        const errorCode = result.error === 'INVALID_TOKEN' ? 'INVALID_TOKEN' : 'TOKEN_EXPIRED';
        return error(res, '', 400, errorCode);
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
        return error(res, '', 404, 'USER_NOT_FOUND');
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
        const statusCode = result.error === 'INVALID_CURRENT_PASSWORD' ? 400 : 500;
        return error(res, '', statusCode, result.error || 'PASSWORD_CHANGE_FAILED');
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
        return error(res, '', 500, 'DELETE_ACCOUNT_FAILED');
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
        const statusCode = result.error === 'INVALID_SEASON' ? 400 : 500;
        return error(res, '', statusCode, result.error || 'INVALID_SEASON');
      }

      return success(res, 'Color season updated', {
        user: result.user
      });
    })
  );

  // GET /analyses-results - Get user's color season and skin analysis results
  router.get('/analyses-results',
    authenticateToken,
    asyncHandler(async (req, res) => {
      const result = await userController.getAnalysesResults(req.user.id);

      if (!result.success) {
        return error(res, '', 500, 'GET_ANALYSES_FAILED');
      }

      return success(res, 'Analyses results retrieved', result.data);
    })
  );

  return router;
};
