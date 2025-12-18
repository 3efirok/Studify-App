import { useQuery } from '@tanstack/react-query';
import { getSharedDeckPublic } from '../api/decks.api';
import { queryKeys } from './keys';

export const useSharedDeck = (shareCode?: string) =>
  useQuery({
    queryKey: shareCode ? queryKeys.sharedDeck(shareCode) : ['shared-deck', 'missing'],
    queryFn: () => {
      if (!shareCode) {
        throw new Error('shareCode is required');
      }
      return getSharedDeckPublic(shareCode);
    },
    enabled: !!shareCode,
  });
