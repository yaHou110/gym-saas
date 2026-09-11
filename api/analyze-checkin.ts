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
    const { athleteName, currentWeight, previousWeight, sleepScore, stressScore, sorenessScore, complianceRate, notes, lang } = req.body || {};
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

    // Sports science rule-based fallback
    const delta = (Number(currentWeight || 0) - Number(previousWeight || 0)).toFixed(1);
    const isFa = lang === 'fa';
    return res.status(200).json({
      success: true,
      data: {
        summary: isFa
          ? `ورزشکار با پایبندی ${complianceRate}% و تغییر وزن ${delta} کیلوگرم عملکرد پایداری داشته است. شاخص خواب (${sleepScore}/۱۰) نیازمند بهینه‌سازی است.`
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
    return res.status(500).json({ error: err.message || 'Failed to analyze check-in' });
  }
}
