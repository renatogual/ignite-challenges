import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';

export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client(
    'https://space-traveling-ignite-renato.prismic.io/api/v2',
    {
      req,
    }
  );

  return prismic;
}
