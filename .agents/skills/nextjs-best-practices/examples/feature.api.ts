import type { IFeatureDAO } from './feature.dao';
import type { IFeatureDTO } from './feature.dto';
import { instance } from '@/services/interceptor';

// Target: src/services/feature.api.ts. Adjust type imports to the module aliases used by the project.
export async function getFeatureAPI(id: string): Promise<IFeatureDAO> {
  const { data } = await instance.get<IFeatureDAO>(`/features/${id}`);
  return data;
}

export async function submitFeatureAPI(payload: IFeatureDTO): Promise<IFeatureDAO> {
  const { data } = await instance.post<IFeatureDAO>('/features', payload);
  return data;
}
