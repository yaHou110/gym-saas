import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '32kb' }));

  const requestCounts = new Map<string, { count: number; resetAt: number }>();
  const rateLimit = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    const current = requestCounts.get(key);
    if (!current || current.resetAt <= now) {
      requestCounts.set(key, { count: 1, resetAt: now + 60_000 });
      return next();
    }
    if (current.count >= 20) return res.status(429).json({ error: 'Too many requests' });
    current.count += 1;
    return next();
  };

  const textField = (value: unknown, max: number): string | undefined =>
    typeof value === 'string' ? value.trim().slice(0, max) : undefined;
  const numberField = (value: unknown, min: number, max: number): number | undefined => {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // Server-side AI Workout Generation Endpoint
  app.post('/api/ai/generate-workout', rateLimit, async (req, res) => {
    try {
      const goal = textField(req.body.goal, 40) || 'Hypertrophy';
      const experienceLevel = textField(req.body.experienceLevel, 40) || 'Intermediate';
      const daysPerWeek = numberField(req.body.daysPerWeek, 1, 7) || 4;
      const injuries = textField(req.body.injuries, 500) || 'None';
      const equipment = textField(req.body.equipment, 500) || 'Commercial gym';
      const lang = req.body.lang === 'fa' ? 'fa' : 'en';
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
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        try {
          const parsed = JSON.parse(text);
          return res.json({ success: true, data: parsed });
        } catch {
          return res.json({ success: true, raw: text });
        }
      }

      // High-quality Sports Science Fallback when API key is pending
      const isFa = lang === 'fa';
      return res.json({
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
      res.status(500).json({ error: err.message || 'Failed to generate workout' });
    }
  });

  // Server-side AI Check-In Analyzer Endpoint
  app.post('/api/ai/analyze-checkin', rateLimit, async (req, res) => {
    try {
      const { athleteName, currentWeight, previousWeight, sleepScore, stressScore, sorenessScore, complianceRate, notes, lang } = req.body;
      const ai = getAI();

      if (ai) {
        const prompt = `You are a Head Coach analyzing a weekly athlete check-in.
Athlete: ${athleteName}
Current Weight: ${currentWeight} kg (Previous: ${previousWeight} kg)
Sleep Quality: ${sleepScore}/10
Stress: ${stressScore}/10
Soreness: ${sorenessScore}/10
Compliance: ${complianceRate}%
Athlete notes: "${notes}"
Language: ${lang === 'fa' ? 'Persian (Farsi)' : 'English'}

Provide a structured JSON response:
{
  "summary": "Brief 2-sentence clinical review of trends",
  "recoveryStatus": "Optimal | Caution | Overtrained",
  "weightDeltaAssessment": "Analysis of the weight trend relative to goals",
  "recommendedActionItems": ["action item 1", "action item 2", "action item 3"],
  "suggestedCoachFeedback": "A motivating, empathetic, and tactical message the coach can send directly to the athlete"
}
Output valid JSON only.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        try {
          const parsed = JSON.parse(text);
          return res.json({ success: true, data: parsed });
        } catch {
          return res.json({ success: true, raw: text });
        }
      }

      // Sports science rule-based fallback
      const delta = (Number(currentWeight || 0) - Number(previousWeight || 0)).toFixed(1);
      const isFa = lang === 'fa';
      return res.json({
        success: true,
        data: {
          summary: isFa
            ? `ورزشکار با پایبندی ${complianceRate}% و تغییر وزن ${delta} کیلوگرم عملکر�� پایداری داشت�� است. شاخص خواب (${sleepScore}/۱۰) نیازمند بهینه‌سازی است.`
            : `Athlete demonstrated solid protocol adherence (${complianceRate}%) with a net weight delta of ${delta}kg. Sleep score (${sleepScore}/10) warrants attention.`,
          recoveryStatus: Number(stressScore || 5) > 7 || Number(sorenessScore || 5) > 7 ? 'Caution' : 'Optimal',
          weightDeltaAssessment: isFa
            ? `تغییر وزن ${delta} کیلوگرم منطبق با فاز جاری است و نشان‌دهنده تعادل کالری مطلوب است.`
            : `Weight fluctuation of ${delta}kg is in line with mesocycle expectations.`,
          recommendedActionItems: isFa
            ? [
                'افزایش زمان خواب به ۷.۵ ساعت مداوم',
                'حفظ بار تمرینی فعلی با نظارت بر درد عضلانی',
                'افزایش ۵۰۰ میلی‌لیتر آب مصرفی روزانه',
              ]
            : [
                'Prioritize minimum 7.5 hours consistent sleep window',
                'Maintain current training volume without abrupt jumps',
                'Add 500ml hydration intake on training days',
              ],
          suggestedCoachFeedback: isFa
            ? `خسته نباشی! روند پیشرفت بدنی و وزنت عالیه. با توجه به خستگی و استرس این هفته، تمرکزت رو بذار روی خواب عمیق‌تر و پروتئین وعده شام تا بدنت ریکاوری بشه.`
            : `Great job on staying consistent this week! Weight progression is tracking on point. Let's make sure you get into bed 30 minutes earlier to assist nervous system recovery.`,
        },
      });
    } catch (err: any) {
      console.error('AI Checkin Analysis error:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze check-in' });
    }
  });

  // Server-side AI Nutrition & Macro Calculation Endpoint
  app.post('/api/ai/calculate-macros', rateLimit, async (req, res) => {
    try {
      const weightKg = numberField(req.body.weightKg, 25, 300);
      const heightCm = numberField(req.body.heightCm, 100, 250);
      const age = numberField(req.body.age, 13, 100);
      if (!weightKg || !heightCm || !age) {
        return res.status(400).json({ error: 'Invalid body metrics' });
      }
      const gender = req.body.gender === 'female' ? 'female' : 'male';
      const goal = textField(req.body.goal, 40) || 'Maintenance';
      const activityLevel = textField(req.body.activityLevel, 40) || 'moderate';
      const lang = req.body.lang === 'fa' ? 'fa' : 'en';
      const w = weightKg;
      const h = heightCm;
      const a = age;
      const isMale = gender !== 'female';

      // Mifflin-St Jeor BMR
      const bmr = isMale
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;

      // Activity multiplier ~ 1.55 for dedicated lifter
      const maintenance = Math.round(bmr * 1.55);
      let targetCalories = maintenance;

      if (goal === 'Hypertrophy') targetCalories = Math.round(maintenance * 1.12);
      else if (goal === 'Fat Loss') targetCalories = Math.round(maintenance * 0.80);
      else if (goal === 'Strength & Power') targetCalories = Math.round(maintenance * 1.08);

      const proteinG = Math.round(w * 2.2); // 2.2g / kg
      const fatG = Math.round((targetCalories * 0.25) / 9); // 25% fat
      const carbCalories = targetCalories - (proteinG * 4 + fatG * 9);
      const carbG = Math.round(carbCalories / 4);
      const waterMl = Math.round(w * 40);

      res.json({
        success: true,
        data: {
          bmr: Math.round(bmr),
          maintenanceCalories: maintenance,
          targetCalories,
          proteinGrams: proteinG,
          carbsGrams: carbG,
          fatsGrams: fatG,
          waterMl,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to calculate macros' });
    }
  });

  // Vite middleware for development
  const httpServer = http.createServer(app);
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // The preview proxy does not forward Vite's HMR WebSocket reliably.
        // Disable the client transport to prevent repeated connection errors.
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Athletica Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to boot server:', err);
});
