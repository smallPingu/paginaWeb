import es from './es.json';
import en from './en.json';
import uk from './uk.json';

export type Locale = 'es' | 'en' | 'uk';

const translations: Record<Locale, typeof es> = { es, en, uk };

export function useTranslations(locale: string) {
  const data = translations[locale as Locale] ?? es;

  function t(path: string): string {
    const keys = path.split('.');
    let result: unknown = data;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }
    return typeof result === 'string' ? result : path;
  }

  return { t, locale };
}
