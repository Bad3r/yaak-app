import { useMutation } from '@tanstack/react-query';
import type { HttpUrlParameter } from '@yaakapp-internal/models';
import { useToast } from '../components/ToastContext';
import { pluralize } from '../lib/pluralize';
import { getHttpRequest } from '../lib/store';
import { useRequestEditor } from './useRequestEditor';
import { useUpdateAnyHttpRequest } from './useUpdateAnyHttpRequest';

export function useImportQuerystring(requestId: string) {
  const updateRequest = useUpdateAnyHttpRequest();
  const toast = useToast();
  const [, { focusParamsTab, forceParamsRefresh, forceUrlRefresh }] = useRequestEditor();

  return useMutation({
    mutationKey: ['import_querystring'],
    mutationFn: async (url: string) => {
      const [baseUrl, ...rest] = url.split('?');
      if (rest.length === 0) return;

      const request = await getHttpRequest(requestId);
      if (request == null) return;

      const querystring = rest.join('?');
      const parsedParams = Array.from(new URLSearchParams(querystring).entries());
      const additionalUrlParameters: HttpUrlParameter[] = parsedParams.map(
        ([name, value]): HttpUrlParameter => ({
          name,
          value,
          enabled: true,
        }),
      );

      const urlParameters: HttpUrlParameter[] = [...request.urlParameters];
      for (const newParam of additionalUrlParameters) {
        const index = urlParameters.findIndex((p) => p.name === newParam.name);
        if (index >= 0) {
          urlParameters[index]!.value = decodeURIComponent(newParam.value);
        } else {
          urlParameters.push(newParam);
        }
      }

      await updateRequest.mutateAsync({
        id: requestId,
        update: {
          url: baseUrl ?? '',
          urlParameters,
        },
      });

      if (additionalUrlParameters.length > 0) {
        toast.show({
          id: 'querystring-imported',
          color: 'info',
          message: `Imported ${additionalUrlParameters.length} ${pluralize('param', additionalUrlParameters.length)} from URL`,
        });
      }

      focusParamsTab();

      // Wait for request to update, then refresh the UI
      // TODO: Somehow make this deterministic
      setTimeout(() => {
        forceUrlRefresh();
        forceParamsRefresh();
      }, 100);
    },
  });
}