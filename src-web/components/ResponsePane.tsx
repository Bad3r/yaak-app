import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useDeleteAllResponses, useDeleteResponse, useResponses } from '../hooks/useResponses';
import { Dropdown } from './Dropdown';
import Editor from './Editor/Editor';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { HStack, VStack } from './Stacks';
import { WindowDragRegion } from './WindowDragRegion';

interface Props {
  requestId: string;
  error: string | null;
}

export function ResponsePane({ requestId, error }: Props) {
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');
  const responses = useResponses(requestId);
  const response = activeResponseId
    ? responses.data.find((r) => r.id === activeResponseId)
    : responses.data[responses.data.length - 1];
  const deleteResponse = useDeleteResponse(response);
  const deleteAllResponses = useDeleteAllResponses(response?.requestId);
  error = response?.error ?? error;

  useEffect(() => {
    setActiveResponseId(null);
  }, [responses.data?.length]);

  const contentType = useMemo(
    () =>
      response?.headers.find((h) => h.name.toLowerCase() === 'content-type')?.value ?? 'text/plain',
    [response],
  );

  const contentForIframe: string | null = useMemo(() => {
    if (!contentType.includes('html')) return null;
    if (response == null) return null;
    if (response.body.includes('<head>')) {
      return response.body.replace(/<head>/gi, `<head><base href="${response.url}"/>`);
    }
    return response.body;
  }, [response?.body, contentType]);

  return (
    <VStack className="w-full">
      <HStack as={WindowDragRegion} items="center" className="pl-1.5 pr-1">
        <Dropdown
          items={[
            {
              label: 'Clear Response',
              onSelect: deleteResponse.mutate,
              disabled: responses.data.length === 0,
            },
            {
              label: 'Clear All Responses',
              onSelect: deleteAllResponses.mutate,
              disabled: responses.data.length === 0,
            },
            '-----',
            ...responses.data.slice(0, 10).map((r) => ({
              label: r.status + ' - ' + r.elapsed + ' ms',
              leftSlot: response?.id === r.id ? <Icon icon="check" /> : <></>,
              onSelect: () => setActiveResponseId(r.id),
            })),
          ]}
        >
          <IconButton icon="gear" className="ml-auto" size="sm" />
        </Dropdown>
      </HStack>
      <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} className="w-full h-full">
        <VStack className="pr-3 pl-1.5 py-3" space={3}>
          {error && <div className="text-white bg-red-500 px-3 py-1 rounded">{error}</div>}
          {response && (
            <>
              <HStack
                items="center"
                className="italic text-gray-500 text-sm w-full h-10 mb-3 flex-shrink-0"
              >
                <div className="whitespace-nowrap">
                  {response.updatedAt.toISOString()}
                  &nbsp;&bull;&nbsp;
                  {response.status}
                  {response.statusReason && ` ${response.statusReason}`}
                  &nbsp;&bull;&nbsp;
                  {response.elapsed}ms &nbsp;&bull;&nbsp;
                  {Math.round(response.body.length / 1000)} KB
                </div>
                <HStack items="center" className="ml-auto">
                  {contentType.includes('html') && (
                    <IconButton
                      icon={viewMode === 'pretty' ? 'eye' : 'code'}
                      size="sm"
                      className="ml-1"
                      onClick={() => setViewMode((m) => (m === 'pretty' ? 'raw' : 'pretty'))}
                    />
                  )}
                </HStack>
              </HStack>
              {viewMode === 'pretty' && contentForIframe !== null ? (
                <iframe
                  title="Response preview"
                  srcDoc={contentForIframe}
                  sandbox="allow-scripts allow-same-origin"
                  className="h-full w-full rounded-lg"
                />
              ) : response?.body ? (
                <Editor
                  valueKey={`${contentType}:${response.body}`}
                  defaultValue={response?.body}
                  contentType={contentType}
                />
              ) : null}
            </>
          )}
        </VStack>
      </motion.div>
    </VStack>
  );
}