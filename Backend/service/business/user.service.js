/**
 * User Service - Business logic only (function-based)
 */

const { 
  encryptPassword, 
  verifyPassword, 
  generateSecureToken,
  hashToken,
  verifyToken,
  generateExpiration,
  isExpired,
  generateJwtToken
} = require('../helpers/security.helper');
const { sendMail } = require('../helpers/email.helper');
const dbModels = require('../../dbo');

const { User, ColorSeason, FavoriteColor } = dbModels;

/**
 * Bejelentkezés, jelszó ellenőrzés és JWT generálás
 */
async function login(username, password) {
  
  //Megkeresi usert az adatbázisban, a színévszakkal együtt
  const user = await User.findOne({ 
    where: { login_name: username },
    include: [
      { model: ColorSeason, as: 'colorSeason' },
      { model: FavoriteColor, as: 'favoriteColors' }
    ]
  });
  
  //Ha nincs, akkor hiba
  if (!user) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }
  
  //Jelszó ellenőrzés, 
  const passwordValid = await verifyPassword(password, user.login_password_hash);
  
  if (!passwordValid) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }

  //Sikeres bejelentkezés, user adat és JWT token generálás
  const userData = formatUser(user);
  //A formázott user adat alapján JWT token generálása
  const token = generateJwtToken(userData);

  return { 
    success: true, 
    user: userData,
    token: token
  };
}

/**
 * Regisztráció, duplikáció ellenőrzés, jelszó titkosítás
 */
async function register(userData) {
  //Adatok kicsomagolása
  const { username, password, email, fullName } = userData;

  // Van-e már ilyen user, ezt lentebb definiált függvény intézi
  await checkUserExists(username, email);

  // User létrehozása, először jelszót titkosítunk
  const hash = await encryptPassword(password);
  //Aztán a jelszavát titkosítva elmentjük az új userrel együtt
  const newUser = await User.create({
    login_name: username,
    login_password_hash: hash,
    email_address: email,
    full_name: fullName
  });

  //A sikeres regisztráció után visszaadjuk a formázott user adatokat
  return { 
    success: true, 
    user: formatUser(newUser)
  };
}

/**
 * Elfelejtett jelszó, token generálás és email küldés
 */
async function forgotPassword(email, emailTemplate) {
  //Megkeresi a usert email alapján
  const user = await User.findOne({ where: { email_address: email } });
  
  // Mindig sikerrel tér vissza, hogy ne lehessen kideríteni, létezik-e a user, emögött is biztonsági okok állnak (user enumeration)
  if (!user) return { success: true };

  // Generál és elment egy tokent, ezt hashelve tárolja az adatbázisban 
  const token = generateSecureToken();
  await user.update({
    password_recovery_hash: await hashToken(token),
    password_recovery_expires: generateExpiration(24)
  });

//Craftolunk egy linket, az encodeURIComponent azért kell, hogy ha speciális karakter van az email címben, akkor se szakadjon meg a link
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  //Az email tartalmát előkészítjük
  const emailContent = prepareEmailContent(emailTemplate, resetLink, user.full_name);
  
  //Aztán itt már elküldjük az emailt, visszakapjuk az eredményt
  const result = await sendMail(email, emailTemplate.subject, emailContent.text, emailContent.html);
  
  if (!result.success) {
    return { success: false, error: 'EMAIL_FAILED' };
  }

  return { success: true };
}

/**
 * Jelszó visszaállítás token alapján, a user a tokennel azonosítja magát
 */
async function resetPassword(token, newPassword) {
  //Megkeresi a usert a token alapján
  const user = await findUserByToken(token);
  
  if (!user) return { success: false, error: 'INVALID_TOKEN' };
  // Ellenőrizzük, hogy a token nem járt-e le
  if (isExpired(user.password_recovery_expires)) {
    return { success: false, error: 'TOKEN_EXPIRED' };
  }

  // Ha minden oké, frissítjük a jelszót, és töröljük a token adatokat
  await user.update({
    login_password_hash: await encryptPassword(newPassword),
    password_recovery_hash: null,
    password_recovery_expires: null
  });

  return { success: true };
}

/**
 * Jelszó változtatás, a user azonosítva van, csak a régi jelszót kell ellenőrizni
 */
async function changePassword(userId, currentPassword, newPassword) {
  //Itt már azonosított userrel dolgozunk
  const user = await User.findOne({ where: { account_id: userId } });
  
  if (!user) {
    return { success: false, error: 'USER_NOT_FOUND' };
  }

  // Ellenőrizzük a jelenlegi jelszót
  if (!(await verifyPassword(currentPassword, user.login_password_hash))) {

    return { success: false, error: 'INVALID_CURRENT_PASSWORD' };
  }

  // Minden oké, frissítjük az új jelszóval
  const newHash = await encryptPassword(newPassword);
  await user.update({
    login_password_hash: newHash
  });

  return { success: true };
}

/**
 * Megnézzük, hogy létezik-e már a user név vagy email cím
 */
async function checkUserExists(username, email) {
  //Egy tömbben párhuzamosan lekérdezzük az adatbázisból
  const [existingUser, existingEmail] = await Promise.all([
    User.findOne({ where: { login_name: username } }),
    User.findOne({ where: { email_address: email } })
  ]);

  //Ha valamelyik nem üres, akkor dobunk egy hibát
  if (existingUser) throw new Error('USERNAME_TAKEN');
  if (existingEmail) throw new Error('EMAIL_TAKEN');
}

/**
 * Token alapján megkeressük a usert
 */
async function findUserByToken(token) {
  //Kikeressük az összes olyan usert, akinek van jelszó visszaállító tokenje
  const users = await User.findAll({
    where: { password_recovery_hash: { [require('sequelize').Op.not]: null } }
  });

  //Végigmegyünk a usereken, és megnézzük, hogy a token egyezik-e valamelyik hashelt tokennel
  for (const user of users) {
    if (await verifyToken(token, user.password_recovery_hash)) {
      return user;
    }
  }
  return null;
}

/**
 * Megformázza a user objektumot a kliens felé
 */
function formatUser(user) {
  console.log('🔍 formatUser called - user.colorSeason:', user.colorSeason ? user.colorSeason.season_name : 'NULL');
  
  const formatted = {
    id: user.account_id,
    username: user.login_name,
    email: user.email_address,
    fullName: user.full_name,
    colorSeason: user.colorSeason ? user.colorSeason.season_name : null,
    colorAnalysisDate: user.color_analysis_date,
    favoriteColors: user.favoriteColors ? user.favoriteColors.map(c => c.color_hex) : []
  };
  
  console.log('🔍 formatUser result - colorSeason:', formatted.colorSeason);
  
  return formatted;
}

/**
 * Előkészíti az email tartalmát a sablon alapján
 */
function prepareEmailContent(template, resetLink, userName = 'Felhasználó') {
  const html = template.html
    .replace(/\{recoveryLink\}/g, resetLink)
    .replace(/\{userFullName\}/g, userName);
  
  const text = template.text ? 
    template.text
      .replace(/\{recoveryLink\}/g, resetLink)
      .replace(/\{userFullName\}/g, userName) : '';

  return { html, text };
}

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
  formatUser,
  checkUserExists,
  findUserByToken,
  prepareEmailContent
};
