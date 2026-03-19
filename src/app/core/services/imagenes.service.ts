import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImagenesService {
  private readonly apiUrl = `${environment.apiUrl}mascotas/`;
  private readonly maxDimension = 1400;
  private readonly initialJpegQuality = 0.78;
  private readonly minJpegQuality = 0.46;
  private readonly targetSizeBytes = 320 * 1024;
  private readonly uploadChunkSize = 2;

  async filesToBase64(files: File[]): Promise<string[]> {
    const results = await Promise.all(files.map((file) => this.readFileAsDataUrl(file)));
    return results.map((result) => result.split(',')[1] ?? result);
  }

  async prepareImagesForUpload(files: File[]): Promise<Array<{ preview: string; base64: string }>> {
    return Promise.all(
      files.map(async (file) => {
        const compressed = await this.compressImage(file);
        const dataUrl = await this.readBlobAsDataUrl(compressed);

        return {
          preview: dataUrl,
          base64: dataUrl.split(',')[1] ?? dataUrl,
        };
      }),
    );
  }

  async cargarImagenesMascota(id: string, imagenesBase64: string[]): Promise<any> {
    const token = localStorage.getItem('token');
    let lastResponse: any = null;

    for (let index = 0; index < imagenesBase64.length; index += this.uploadChunkSize) {
      const chunk = imagenesBase64.slice(index, index + this.uploadChunkSize);
      const response = await axios.patch(
        `${this.apiUrl}${id}/imagenes`,
        { imagenes: chunk },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      lastResponse = response.data;
    }

    return lastResponse;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private readBlobAsDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private compressImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        const { width, height } = this.calculateDimensions(image.width, image.height);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        if (!context) {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        this.exportCompressedBlob(canvas).then((blob) => {
          URL.revokeObjectURL(objectUrl);
          resolve(blob ?? file);
        });
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      image.src = objectUrl;
    });
  }

  private async exportCompressedBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    let quality = this.initialJpegQuality;
    let blob = await this.canvasToBlob(canvas, quality);

    while (blob && blob.size > this.targetSizeBytes && quality > this.minJpegQuality) {
      quality = Number((quality - 0.08).toFixed(2));
      blob = await this.canvasToBlob(canvas, quality);
    }

    return blob;
  }

  private canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    });
  }

  private calculateDimensions(originalWidth: number, originalHeight: number): { width: number; height: number } {
    if (originalWidth <= this.maxDimension && originalHeight <= this.maxDimension) {
      return { width: originalWidth, height: originalHeight };
    }

    const ratio = Math.min(this.maxDimension / originalWidth, this.maxDimension / originalHeight);

    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio),
    };
  }
}
