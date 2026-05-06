import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly siteName = 'Circulo Animal';
  private readonly siteUrl = 'https://circuloanimal.cl';
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly document = inject(DOCUMENT);

  setPage(title: string, description: string, imageUrl?: string, robots = 'index, follow'): void {
    const resolvedTitle = title.trim();
    const resolvedDescription = description.trim();
    const resolvedUrl = this.getCurrentUrl();
    const resolvedImage = imageUrl?.trim() || this.getDefaultImageUrl();

    this.titleService.setTitle(resolvedTitle);
    this.metaService.updateTag({ name: 'description', content: resolvedDescription });
    this.metaService.updateTag({ name: 'robots', content: robots });

    this.metaService.updateTag({ property: 'og:title', content: resolvedTitle });
    this.metaService.updateTag({ property: 'og:description', content: resolvedDescription });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: this.siteName });
    this.metaService.updateTag({ property: 'og:locale', content: 'es_CL' });
    this.metaService.updateTag({ property: 'og:image', content: resolvedImage });
    this.metaService.updateTag({ property: 'og:url', content: resolvedUrl });

    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: resolvedTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: resolvedDescription });
    this.metaService.updateTag({ name: 'twitter:image', content: resolvedImage });

    this.setCanonical(resolvedUrl);
  }

  private getCurrentUrl(): string {
    if (typeof window !== 'undefined' && window.location?.href) {
      try {
        const current = new URL(window.location.href);
        return `${current.origin}${current.pathname}`;
      } catch {
        return window.location.href;
      }
    }

    const href = this.document?.location?.href || '';

    try {
      const current = new URL(href);
      return `${current.origin}${current.pathname}`;
    } catch {
      return href;
    }
  }

  private getDefaultImageUrl(): string {
    const origin = typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : this.document?.location?.origin || this.siteUrl;

    return `${origin}/assets/icons/logo_circuloanimal.png`;
  }

  private setCanonical(url: string): void {
    if (!this.document?.head) {
      return;
    }

    let canonicalElement = this.document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;

    if (!canonicalElement) {
      canonicalElement = this.document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonicalElement);
    }

    canonicalElement.setAttribute('href', url);
  }
}
