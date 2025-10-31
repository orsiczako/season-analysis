const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/**
 * Itt mindenféle biztonsági cucc van
 */

//Megmondjuk milyen algoval hasheljen
const SECURITY_HASH_ALGO = 'sha512'

/**
Kap egy sima szöveget, meghatározzuk mivel hashel 
 */
const getHash = function (clearText) {

    //létrehoz egy hash objektumot, ami majd azt a hasht csinálja, amit megadtunk neki
    let hasher = crypto.createHash(SECURITY_HASH_ALGO)

    //Itt a szöveg, itt a kódolás
    let hash = hasher.update(clearText, 'utf-8')

    //Hexadecimális formátumban adjuk vissza a szöveget
    return hash.digest('hex')
}

/**
Meg kellene sózni
Generálunk véletlenszerű sót, 10 a salt round, közben az await toporog
Ez jó a rainbow table támadás ellen, ami annyit jelent, hogy ilyen előre kiszámolt hasheket tárolnak el, 
és ha a jelszó hashe megegyezik egy ilyen előre kiszámoltal, akkor tudják hogy mi a jelszó (erre most kerestem rá, nem emlékeztem mi ez)
na de lényeg, hogy nincs brute force
 */
const encryptPassword = async function (clearText) {

    const salt = await bcrypt.genSalt(10)

    //Jelszót a sóval hasheljük
    return bcrypt.hash(clearText, salt)
}

/**
Megnézzük, hogy egyezik-e a jelszó
 */
const verifyPassword = async function (clearText, hash) {
    //Visszaadja, hogy a jelszó megegyezik-e a hashelt változattal, előtte kiveszi a saltot,
    //  és azzal hasheli a cleartextet, egyezik? 
    return await bcrypt.compare(clearText, hash)
}

/**
Tokent generálunk, ez jól jön majd emailes megerősítésnél, de jelszó visszaállításnál is, a user
kvázi ezzel azonosítja magát majd
 */
const generateSecureToken = function (length = 32) {

    return crypto.randomBytes(length).toString('hex')
}

/**
A tokent is hasheljük, a salt round megint 10
 */
const hashToken = async function (token) {
    return await bcrypt.hash(token, 10)
}

/**
Ellenőrizzük a tokent a hashelttel
 */
const verifyToken = async function (token, hash) {
    return await bcrypt.compare(token, hash)
}

/**
Generálunk egy lejárati dátumot
 */
const generateExpiration = function (hours = 24) {
    const expiration = new Date()
    expiration.setHours(expiration.getHours() + hours)
    return expiration
}

/**
Ellenőrizzük hogy lejárt-e a dátum
 */
const isExpired = function (expirationDate) {
    return new Date() > new Date(expirationDate)
}

/**
Generálunk egy JWT tokent, minden kérésnél küldjük (papíron)
 */
const generateJwtToken = function (userData, expiresIn = '24h') {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
    
    //Ezeket tartalmazza a token
    const payload = {
        id: userData.id,
        username: userData.username,
        email: userData.email
    }
    
    return jwt.sign(payload, secret, { expiresIn })
}

/**
Ellenőrizzük a JWT tokent
 */
const verifyJwtToken = function (token) {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
        
        return jwt.verify(token, secret)
    } catch (error) {

        return null
    }
}

module.exports = {
    getHash,
    encryptPassword,
    verifyPassword,
    generateSecureToken,
    hashToken,
    verifyToken,
    generateExpiration,
    isExpired,
    generateJwtToken,
    verifyJwtToken
}
