/**
 * Egységes API response helper - Function-based (i18n nélkül)
 */


/*
Sikeres válasz küldése res -> response objektum, a data opcionális
*/
function success(res, message = 'Success', data = null, statusCode = 200) {
  const response = {
    success: true, //létrejön egy response objektum
    message
  };

  if (data) {
    Object.assign(response, data);
  }

  return res.status(statusCode).json(response);
}

function error(res, message = 'Error', statusCode = 400, errorCode = null) {
  const response = {
    success: false,
    message
  };

  if (errorCode) {
    response.errorCode = errorCode;
  }

  return res.status(statusCode).json(response);
}

function serverError(res, err = null) {
  console.error('Server error:', err);
  return res.status(500).json({
    success: false,
    message: 'Server error occurred'
  });
}

function validationError(res, message = 'Validation failed') {
  return error(res, message, 400, 'VALIDATION_ERROR');
}

module.exports = {
  success,
  error,
  serverError,
  validationError
};