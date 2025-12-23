import { useState, useCallback, useEffect } from 'react';
import useApi from '@common/hooks/useApi';
import ApiRoutes from '../defs/api-routes';
import { WEBSITE_FOCUS } from '../defs/types';

interface UseWebsiteFocusReturn {
  websiteFocus: WEBSITE_FOCUS | null;
  isLoading: boolean;
  error: string | null;
  updateWebsiteFocus: (focus: WEBSITE_FOCUS) => Promise<void>;
}

const useWebsiteFocus = (): UseWebsiteFocusReturn => {
  const [websiteFocus, setWebsiteFocus] = useState<WEBSITE_FOCUS | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchApi = useApi();

  // Fetch current website focus on mount
  const fetchWebsiteFocus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchApi<{ website_focus?: string; websiteFocus?: string }>(
        ApiRoutes.GetWebsiteFocus,
        { verbose: false }
      );

      if (response.success && response.data) {
        // Handle both snake_case and camelCase from backend
        const focusValue = response.data.website_focus || response.data.websiteFocus;

        if (focusValue) {
          setWebsiteFocus(focusValue as WEBSITE_FOCUS);
        } else {
          setWebsiteFocus(WEBSITE_FOCUS.ALL); // Default
        }
      } else {
        setError('Failed to fetch website focus');
      }
    } catch (err) {
      console.error('Error fetching website focus:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  // Update website focus
  const updateWebsiteFocus = useCallback(
    async (focus: WEBSITE_FOCUS) => {
      setError(null);

      // Optimistic update
      const previousFocus = websiteFocus;
      setWebsiteFocus(focus);

      // Show subtle loading indicator
      setIsLoading(true);

      try {
        // Use dedicated endpoint that handles updateOrCreate
        const updateResponse = await fetchApi(ApiRoutes.UpdateWebsiteFocus, {
          method: 'PUT',
          data: { value: focus },
          verbose: true,
        });

        if (updateResponse.success) {
          // Successfully updated
          setIsLoading(false);
        } else {
          // Revert on failure
          setWebsiteFocus(previousFocus);
          setError(updateResponse.errors?.[0] || 'Failed to update website focus');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error updating website focus:', err);
        // Revert on error
        setWebsiteFocus(previousFocus);
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    },
    [fetchApi, websiteFocus]
  );

  useEffect(() => {
    fetchWebsiteFocus();
  }, [fetchWebsiteFocus]);

  return {
    websiteFocus,
    isLoading,
    error,
    updateWebsiteFocus,
  };
};

export default useWebsiteFocus;
