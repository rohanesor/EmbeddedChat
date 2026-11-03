import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useComponentOverrides } from '@embeddedchat/ui-elements';
import { useChannelStore, useMessageStore } from '../../store';
import { useRCContext } from '../../context/RCInstance';
import { MessageAggregator } from './common/MessageAggregator';

const FileGallery = () => {
  const { RCInstance } = useRCContext();
  const { variantOverrides } = useComponentOverrides('FileGallery');
  const viewType = variantOverrides.viewType || 'Sidebar';

  const isChannelPrivate = useChannelStore((state) => state.isChannelPrivate);
  const messages = useMessageStore((state) => state.messages);

  const [text, setText] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [files, setFiles] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const options = [
    { value: 'all', label: 'All' },
    { value: 'application', label: 'Files' },
    { value: 'video', label: 'Videos' },
    { value: 'image', label: 'Images' },
    { value: 'audio', label: 'Audios' },
    { value: 'text', label: 'Texts' },
  ];

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const filteredFiles = useMemo(
    () =>
      files.filter((file) =>
        file.name?.toLowerCase().includes(text.toLowerCase())
      ),
    [files, text]
  );

  const fetchFiles = useCallback(async () => {
    setIsFetching(true);
    const typeGroup = selectedFilter === 'all' ? '' : selectedFilter;
    const res = await RCInstance.getAllFiles(isChannelPrivate, typeGroup);
    if (res?.files) {
      const sortedFiles = res.files.sort(
        (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );
      setFiles(sortedFiles);
    }
    setIsFetching(false);
  }, [RCInstance, isChannelPrivate, selectedFilter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, messages]);

  const handleFilterSelect = (val) => {
    setSelectedFilter(val);
  };

  return (
    <MessageAggregator
      title="Files"
      iconName="attachment"
      noMessageInfo="No Files Found"
      filterProps={{
        isFile: true,
        options,
        value: selectedFilter,
        handleFilterSelect,
      }}
      searchProps={{
        isSearch: true,
        handleInputChange,
        placeholder: 'Search Files',
      }}
      fetching={isFetching}
      shouldRender={(file) => file.path}
      type="file"
      searchFiltered={filteredFiles}
      onDeleteFile={fetchFiles}
      viewType={viewType}
    />
  );
};

export default FileGallery;
