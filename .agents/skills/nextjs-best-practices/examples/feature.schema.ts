import { z } from 'zod';

// Target: src/modules/Feature/Validation/feature.schema.ts
export const featureSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter'),
  email: z.string().trim().email('Format email tidak valid'),
});

export type IFeatureFormData = z.infer<typeof featureSchema>;
