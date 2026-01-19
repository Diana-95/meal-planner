import { axiosInstanceAuth } from './utils';

const API_URL = '/api/upload';

export interface UploadImageResponse {
  success: boolean;
  imageUrl: string;
  filename: string;
}

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axiosInstanceAuth.post<UploadImageResponse>(
    `${API_URL}/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const deleteImage = async (filename: string): Promise<{ success: boolean; message?: string }> => {
  const response = await axiosInstanceAuth.delete<{ success: boolean; message?: string }>(
    `${API_URL}/image/${filename}`
  );
  return response.data;
};
