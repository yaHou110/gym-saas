import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { weightKg, heightCm, age, gender, goal } = req.body || {};
    const w = Number(weightKg) || 75;
    const h = Number(heightCm) || 175;
    const a = Number(age) || 26;
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

    return res.status(200).json({
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
    return res.status(500).json({ error: err.message || 'Failed to calculate macros' });
  }
}
