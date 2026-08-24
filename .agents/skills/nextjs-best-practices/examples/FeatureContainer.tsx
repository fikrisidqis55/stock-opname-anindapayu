'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FeatureComponent } from './FeatureComponent';
import { getFeatureAPI, submitFeatureAPI } from './feature.api';
import type { IFeatureDTO } from './feature.dto';
import { featureSchema, type IFeatureFormData } from './feature.schema';

// Target: src/modules/Feature/Container/FeatureContainer.tsx
export function FeatureContainer({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<IFeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: { name: '', email: '' },
  });

  const detailQuery = useQuery({
    queryKey: ['feature', 'detail', id],
    queryFn: () => getFeatureAPI(id),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (detailQuery.data) {
      reset({ name: detailQuery.data.name, email: detailQuery.data.email });
    }
  }, [detailQuery.data, reset]);

  const mutation = useMutation({
    mutationFn: submitFeatureAPI,
    onSuccess: (saved) => {
      toast.success('Data berhasil disimpan');
      queryClient.setQueryData(['feature', 'detail', saved.id], saved);
      queryClient.invalidateQueries({ queryKey: ['feature', 'list'] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data.message ?? 'Gagal menyimpan data');
    },
  });

  const submit = (formData: IFeatureFormData) => {
    const payload: IFeatureDTO = { name: formData.name, email: formData.email };
    mutation.mutate(payload);
  };

  return (
    <FeatureComponent
      control={control}
      errors={errors}
      onSubmit={() => void handleSubmit(submit)()}
      isLoading={detailQuery.isLoading || mutation.isPending}
      detailData={detailQuery.data}
    />
  );
}
