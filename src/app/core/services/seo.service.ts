import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly document = inject(DOCUMENT);

  setPage(title: string, description: string, imageUrl?: string): void {
    const resolvedTitle = title.trim();
    const resolvedDescription = description.trim();
    const resolvedUrl = this.getCurrentUrl();
    const resolvedImage = imageUrl?.trim() || this.getDefaultImageUrl();

    this.titleService.setTitle(resolvedTitle);
    this.metaService.updateTag({ name: 'description', content: resolvedDescription });
    this.metaService.updateTag({ property: 'og:title', content: resolvedTitle });
    this.metaService.updateTag({ property: 'og:description', content: resolvedDescription });
    this.metaService.updateTag({ property: 'og:image', content: resolvedImage });
    this.metaService.updateTag({ property: 'og:url', content: resolvedUrl });
  }

  private getCurrentUrl(): string {
    if (typeof window !== 'undefined' && window.location?.href) {
      return window.location.href;
    }

    return this.document?.location?.href || '';
  }

  private getDefaultImageUrl(): string {
    const origin = typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : this.document?.location?.origin || '';

    return `${origin}/favicon.ico`;
  }
}
