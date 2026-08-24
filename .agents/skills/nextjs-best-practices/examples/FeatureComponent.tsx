'use client';

import { Button, Card, Form, Input, Spin } from 'antd';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import type { IFeatureDAO } from './feature.dao';
import type { IFeatureFormData } from './feature.schema';

interface FeatureComponentProps {
  control: Control<IFeatureFormData>;
  errors: FieldErrors<IFeatureFormData>;
  onSubmit: () => void;
  isLoading: boolean;
  detailData?: IFeatureDAO;
}

// Target: src/modules/Feature/Component/FeatureComponent.tsx
export function FeatureComponent({
  control,
  errors,
  onSubmit,
  isLoading,
  detailData,
}: FeatureComponentProps) {
  return (
    <Card title={detailData ? `Edit ${detailData.name}` : 'Form Data'} className="mx-auto my-6 max-w-xl">
      {isLoading ? (
        <Spin className="my-8 block" />
      ) : (
        <Form layout="vertical" onFinish={onSubmit}>
          <Form.Item
            label="Nama"
            validateStatus={errors.name ? 'error' : undefined}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Masukkan nama" />}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            validateStatus={errors.email ? 'error' : undefined}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input {...field} type="email" placeholder="Masukkan email" />}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Simpan
          </Button>
        </Form>
      )}
    </Card>
  );
}
