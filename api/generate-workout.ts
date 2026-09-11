import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { goal, experienceLevel, daysPerWeek, injuries, equipment, lang } = req.body || {};
    const ai = getAI();

    if (ai) {
      const prompt = `You are a world-class Elite Strength & Conditioning Coach (CSCS) and Sports Scientist.
Design an optimal training program session based on:
- Goal: ${goal || 'Hypertrophy'}
- Experience Level: ${experienceLevel || 'Intermediate'}
- Days per week: ${daysPerWeek || 4}
- Injury/Restrictions: ${injuries || 'None'}
- Available Equipment: ${equipment || 'Commercial Gym with Barbells, Dumbbells, Cables, and Machines'}
- Output Language: ${lang === 'fa' ? 'Persian (Farsi)' : 'English'}

Provide a JSON object with:
{
  "title": "Program / Session Title",
  "focus": "Target Muscle Groups",
  "warmup": "Specific 5-min prep sequence",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": 4,
      "reps": "8-10",
      "rpe": 8,
      "restSeconds": 90,
      "tempo": "3-0-1-0",
      "cues": "Key technique cue"
    }
  ],
  "cooldown": "Key stretches",
  "coachNotes": "Scientific rationale"
}
Output valid JSON only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        return res.status(200).json({ success: true, data: parsed });
      } catch {
        return res.status(200).json({ success: true, raw: text });
      }
    }

    // High-quality Sports Science Fallback when API key is not configured
    const isFa = lang === 'fa';
    return res.status(200).json({
      success: true,
      data: {
        title: isFa
          ? `برنامه تخصصی ${goal || 'هایپرتروفی'} - سطح ${experienceLevel || 'متوسط'}`
          : `Periodized ${goal || 'Hypertrophy'} Protocol - ${experienceLevel || 'Intermediate'}`,
        focus: isFa ? 'سینه، پشت، دلتوئید و زنجیره فوقانی' : 'Chest, Lats, Deltoids & Core Stabilization',
        warmup: isFa
          ? '۵ دقیقه هوازی سبک، کشش پویا، فعال‌سازی کتف با کش و فیس‌پول (۲ ست ۲۰ تکرار)'
          : '5 min dynamic warm-up: shoulder dislocates, band pull-aparts, thoracic rotations, and warm-up ramp sets.',
        exercises: [
          {
            name: isFa ? 'پرس سینه با هالتر روی نیمکت صاف' : 'Barbell Bench Press',
            sets: 4,
            reps: '6-8',
            rpe: 8,
            restSeconds: 120,
            tempo: '3-0-1-0',
            cues: isFa ? 'حفظ قوس طبیعی کمر و انقباض عضلات باسن، کنترل فاز منفی' : 'Maintain scapular retraction, drive feet into floor, controlled descent.',
          },
          {
            name: isFa ? 'بارفیکس با وزنه یا لت پول‌داون' : 'Weighted Pull-Up or Lat Pulldown',
            sets: 3,
            reps: '8-10',
            rpe: 8.5,
            restSeconds: 90,
            tempo: '2-1-1-0',
            cues: isFa ? 'کشش کامل در انتها و انقباض اوج در بالای میله' : 'Lead with elbows back and down; avoid momentum.',
          },
          {
            name: isFa ? 'پرس بالا سینه با دمبل (شیب ۳۰ درجه)' : 'Incline Dumbbell Press (30 deg)',
            sets: 3,
            reps: '10-12',
            rpe: 8.5,
            restSeconds: 90,
            tempo: '3-1-1-0',
            cues: isFa ? 'دامنه حرکتی کامل با مکث کوتاه در کشش پایین' : 'Deep pectoral stretch at bottom, press in slight arc.',
          },
          {
            name: isFa ? 'نشر جانب با دمبل کنترل‌شده' : 'Strict Dumbbell Lateral Raise',
            sets: 4,
            reps: '12-15',
            rpe: 9,
            restSeconds: 60,
            tempo: '2-0-1-1',
            cues: isFa ? 'حرکت در صفحه کتف بدون تکان دادن تنه' : 'Raise in scapular plane with thumb slightly tipped down.',
          },
        ],
        cooldown: isFa ? 'کشش ایستایی عضلات سینه در زاویه ۹۰ درجه و آویزان شدن آزاد برای کاهش فشار ستون فقرات' : 'Dead hangs for spinal decompression (2x45s) and doorway pectoral stretch.',
        coachNotes: isFa ? 'طراحی شده طبق متدولوژی اضافه بار تصاعدی با تمرکز بر حجم مفید مکانیکی.' : 'Periodized hypertrophy sequence targeting high mechanical tension with strict fatigue management.',
      },
    });
  } catch (err: any) {
    console.error('AI Workout error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate workout' });
  }
}
