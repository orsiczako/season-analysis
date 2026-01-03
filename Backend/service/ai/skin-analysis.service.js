/**
 * Bőrelemzés szolgáltatás - Python ML modellek hívása
 * - Bőrtípus modell (oily/dry/normal/combination)
 * - Bőrprobléma modell (Acne, Bags, Milia, Redness, Scars, WhiteHead)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// Python scriptek elérési útjai
const SKIN_TYPE_SCRIPT = path.join(__dirname, '..', '..', '..', 'ML', 'scripts', 'predict_app.py');
const SKIN_PROBLEMS_SCRIPT = path.join(__dirname, '..', '..', '..', 'ML', 'scripts', 'predict_skin_problems.py');

/**
 * Python script futtatása és eredmény visszaadása
 */
function runPythonScript(scriptPath, imagePath) {
  return new Promise((resolve, reject) => {
    console.log('Running Python script:', scriptPath);
    console.log('Image path:', imagePath);

    const pythonProcess = spawn('python', [scriptPath, imagePath]);

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorData);
        return resolve({ success: false, error: errorData });
      }

      // JSON keresése a kimenetben (TensorFlow warningok kiszűrése)
      const lines = outputData.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const result = JSON.parse(trimmed);
            return resolve({ success: true, data: result });
          } catch (e) {
            continue;
          }
        }
      }

      resolve({ success: false, error: 'No valid JSON output' });
    });

    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Teljes bőrelemzés végrehajtása (típus + problémák)
 */
async function analyzeSkin(imagePath) {
  try {
    // Ellenőrizzük, hogy létezik-e a kép
    try {
      await fs.access(imagePath);
    } catch (err) {
      return {
        success: false,
        error: 'IMAGE_NOT_FOUND',
        message: 'A feltöltött kép nem található.'
      };
    }

    // Mindkét modellt párhuzamosan futtatjuk
    const [skinTypeResult, skinProblemsResult] = await Promise.all([
      runPythonScript(SKIN_TYPE_SCRIPT, imagePath),
      runPythonScript(SKIN_PROBLEMS_SCRIPT, imagePath)
    ]);

    console.log('Skin type result:', skinTypeResult);
    console.log('Skin problems result:', skinProblemsResult);

    // Ha a bőrtípus elemzés sikertelen, az kritikus hiba
    if (!skinTypeResult.success) {
      return {
        success: false,
        error: 'SKIN_TYPE_ANALYSIS_FAILED',
        message: 'A bőrtípus elemzés sikertelen volt.'
      };
    }

    // Eredmény összeállítása
    const result = {
      skinType: skinTypeResult.data.skinType,
      confidence: skinTypeResult.data.confidence,
      details: skinTypeResult.data.details,
      // Bőrproblémák (ha sikeres volt)
      skinProblems: skinProblemsResult.success ? {
        detected: skinProblemsResult.data.detected || [],
        hasProblems: skinProblemsResult.data.has_problems || false,
        allScores: skinProblemsResult.data.all_scores || {}
      } : null
    };

    return {
      success: true,
      data: result
    };

  } catch (err) {
    console.error('Skin analysis error:', err);
    return {
      success: false,
      error: 'ANALYSIS_ERROR',
      message: 'Váratlan hiba történt az elemzés során.'
    };
  }
}

/**
 * Betölti a bőrtípushoz tartozó ápolási protokollt
 */
async function getSkinProtocol(skinType) {
  try {
    const protocolPath = path.join(__dirname, '..', '..', '..', 'ML', 'protocols', 'skin', `${skinType}.json`);

    try {
      const data = await fs.readFile(protocolPath, 'utf-8');
      return {
        success: true,
        data: JSON.parse(data)
      };
    } catch (err) {
      return {
        success: false,
        error: 'PROTOCOL_NOT_FOUND',
        message: 'Az ápolási protokoll nem található.'
      };
    }
  } catch (err) {
    console.error('Error loading protocol:', err);
    return {
      success: false,
      error: 'PROTOCOL_ERROR',
      message: 'Hiba történt az ápolási protokoll betöltése során.'
    };
  }
}

/**
 * Betölti a bőrproblémákhoz tartozó protokollokat
 */
async function getSkinProblemsProtocol(detectedProblems) {
  try {
    const protocolPath = path.join(__dirname, '..', '..', '..', 'Frontend', 'public', 'protocols', 'skin_problems', 'skin_problems.json');

    const data = await fs.readFile(protocolPath, 'utf-8');
    const allProtocols = JSON.parse(data);

    // Problem name -> protocol key mapping
    const protocolMapping = {
      'Acne': 'acneMasterProtocol',
      'Bags': 'bagsMasterProtocol',
      'Milia': 'miliaMasterProtocol',
      'Redness': 'rednessMasterProtocol',
      'Scars': 'scarsMasterProtocol',
      'WhiteHead': 'whiteheadMasterProtocol'
    };

    // Csak a detektált problémák protokolljait adjuk vissza
    const relevantProtocols = {};

    if (detectedProblems && detectedProblems.length > 0) {
      for (const problem of detectedProblems) {
        const protocolKey = protocolMapping[problem.problem];
        if (protocolKey && allProtocols.skinProblemsDatabase[protocolKey]) {
          relevantProtocols[problem.problem] = allProtocols.skinProblemsDatabase[protocolKey];
        }
      }
    }

    return {
      success: true,
      data: relevantProtocols
    };
  } catch (err) {
    console.error('Error loading skin problems protocol:', err);
    return {
      success: false,
      error: 'PROTOCOL_ERROR',
      message: 'Hiba történt a bőrprobléma protokoll betöltése során.'
    };
  }
}

module.exports = {
  analyzeSkin,
  getSkinProtocol,
  getSkinProblemsProtocol
};
