const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

// Predefined specialties for fallback matching
const SPECIALTIES = [
  'General Physician',
  'Neurologist',
  'Cardiologist',
  'Dermatologist',
  'Orthopedist',
  'Pediatrician',
  'Gastroenterologist',
  'Ophthalmologist',
  'Psychiatrist',
  'Otolaryngologist'
];

// Fallback keyword-based matching function
const fallbackAnalyzeSymptoms = (text) => {
  const lowercaseText = text.toLowerCase();
  
  if (lowercaseText.includes('headache') || lowercaseText.includes('migraine') || lowercaseText.includes('blurry vision') || lowercaseText.includes('seizure') || lowercaseText.includes('numbness')) {
    return {
      specialty: 'Neurologist',
      reason: 'Symptoms like headaches, migraines, blurry vision, or numbness relate to the nervous system and brain, which are treated by a Neurologist.'
    };
  }
  if (lowercaseText.includes('chest pain') || lowercaseText.includes('heart') || lowercaseText.includes('palpitation') || lowercaseText.includes('breath') || lowercaseText.includes('cardio')) {
    return {
      specialty: 'Cardiologist',
      reason: 'Symptoms such as chest pain or palpitations are cardiorespiratory indicators typically evaluated by a Cardiologist.'
    };
  }
  if (lowercaseText.includes('skin') || lowercaseText.includes('rash') || lowercaseText.includes('acne') || lowercaseText.includes('itch') || lowercaseText.includes('eczema') || lowercaseText.includes('mole')) {
    return {
      specialty: 'Dermatologist',
      reason: 'Dermatologists specialize in treating skin, hair, and nail disorders like rashes, acne, and itching.'
    };
  }
  if (lowercaseText.includes('bone') || lowercaseText.includes('joint') || lowercaseText.includes('fracture') || lowercaseText.includes('back pain') || lowercaseText.includes('muscle') || lowercaseText.includes('sprain') || lowercaseText.includes('knee')) {
    return {
      specialty: 'Orthopedist',
      reason: 'Bone, joint, back, or muscle issues fall under musculoskeletal health, which is the domain of an Orthopedist.'
    };
  }
  if (lowercaseText.includes('child') || lowercaseText.includes('kid') || lowercaseText.includes('baby') || lowercaseText.includes('infant') || lowercaseText.includes('pediatric')) {
    return {
      specialty: 'Pediatrician',
      reason: 'Pediatricians specialize in medical care for infants, children, and adolescents.'
    };
  }
  if (lowercaseText.includes('stomach') || lowercaseText.includes('acid') || lowercaseText.includes('gut') || lowercaseText.includes('digestion') || lowercaseText.includes('constipation') || lowercaseText.includes('diarrhea') || lowercaseText.includes('nausea')) {
    return {
      specialty: 'Gastroenterologist',
      reason: 'Stomach pain, acid reflux, and digestive issues are handled by a Gastroenterologist.'
    };
  }
  if (lowercaseText.includes('eye') || lowercaseText.includes('vision') || lowercaseText.includes('blind') || lowercaseText.includes('cataract') || lowercaseText.includes('glasses')) {
    return {
      specialty: 'Ophthalmologist',
      reason: 'Ophthalmologists specialize in eye health, vision problems, and corrective eye care.'
    };
  }
  if (lowercaseText.includes('ear') || lowercaseText.includes('nose') || lowercaseText.includes('throat') || lowercaseText.includes('sinus') || lowercaseText.includes('hearing') || lowercaseText.includes('ent')) {
    return {
      specialty: 'Otolaryngologist',
      reason: 'Ear, nose, throat, or sinus symptoms are best handled by an Otolaryngologist (ENT Specialist).'
    };
  }
  if (lowercaseText.includes('depress') || lowercaseText.includes('anxiety') || lowercaseText.includes('panic') || lowercaseText.includes('mental') || lowercaseText.includes('sleep') || lowercaseText.includes('insomnia')) {
    return {
      specialty: 'Psychiatrist',
      reason: 'Anxiety, depression, sleep issues, or mental distress are diagnosed and treated by a Psychiatrist.'
    };
  }

  // Default fallback
  return {
    specialty: 'General Physician',
    reason: 'For general symptoms (fever, cough, cold) or when symptoms are broad, consulting a General Physician is the recommended first step.'
  };
};

// @desc    Analyze symptoms using AI or Fallback and return medical specialty
// @route   POST /api/symptoms/analyze
// @access  Private (or Public, let's keep it Private for authenticated patients/doctors, or Public. Prompt says: "Create an endpoint /api/symptoms/analyze ... Patients can either search ... describe symptoms". Let's protect it so only authenticated users call it, or keep it open for search flexibility. Let's require basic authentication.)
const analyzeSymptoms = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.trim() === '') {
    return res.status(400).json({ message: 'Symptoms description is required' });
  }

  const prompt = `You are an expert medical routing AI. Analyze the following patient symptom description: "${symptoms}".
Determine the most appropriate medical specialty the patient should consult.
Choose exactly one specialty from this list:
${SPECIALTIES.map(s => `- ${s}`).join('\n')}

Format your response strictly as a JSON object with two fields:
{
  "specialty": "Name of the specialty selected from the list",
  "reason": "A brief explanation of why this specialty was selected."
}`;

  // 1. Try Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (error) {
      console.error('Gemini API Error, falling back:', error.message);
    }
  }

  // 2. Try OpenAI API
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      const responseText = response.choices[0].message.content;
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (error) {
      console.error('OpenAI API Error, falling back:', error.message);
    }
  }

  // 3. Fallback logic (local rules-based matching)
  console.log('Using local fallback for symptom analysis...');
  const result = fallbackAnalyzeSymptoms(symptoms);
  return res.json(result);
};

module.exports = {
  analyzeSymptoms,
  SPECIALTIES
};
