import React, { useEffect, useRef } from 'react';
import { formatBytes } from '../api';
import { btnSecondary as btnClass } from '../components';

// Renders one material. onPosition/onEnded are used by the player to save progress.
export default function MaterialViewer({ material, startAt = 0, onPosition, onEnded }) {
  const mediaRef = useRef(null);
  const lastSent = useRef(0);
  const materialId = material && material._id;

  useEffect(() => {
    lastSent.current = 0;
  }, [materialId]);

  const onLoaded = () => {
    const el = mediaRef.current;
    if (el && startAt > 5 && el.duration && startAt < el.duration - 5) el.currentTime = startAt;
  };

  const onTime = () => {
    const el = mediaRef.current;
    if (!el || !onPosition) return;
    const now = Date.now();
    if (now - lastSent.current < 15000) return;
    lastSent.current = now;
    onPosition(el.currentTime, el.duration);
  };

  if (!material) return null;
  const { type } = material;

  const download = material.downloadUrl && (
    <a href={material.downloadUrl} className={btnClass}>
      Download{material.sizeBytes ? ` (${formatBytes(material.sizeBytes)})` : ''}
    </a>
  );

  let body = null;
  if (type === 'video') {
    body = (
      <video
        key={material._id}
        ref={mediaRef}
        src={material.url}
        controls
        controlsList={material.downloadUrl ? undefined : 'nodownload'}
        onContextMenu={(e) => !material.downloadUrl && e.preventDefault()}
        onLoadedMetadata={onLoaded}
        onTimeUpdate={onTime}
        onEnded={onEnded}
        className="w-full rounded-xl bg-black aspect-video"
      />
    );
  } else if (type === 'audio') {
    body = (
      <audio key={material._id} ref={mediaRef} src={material.url} controls onLoadedMetadata={onLoaded} onTimeUpdate={onTime} onEnded={onEnded} className="w-full" />
    );
  } else if (type === 'pdf') {
    body = <iframe key={material._id} src={material.url} title={material.title} className="w-full h-[75vh] rounded-xl border border-slate-200 bg-slate-50" />;
  } else if (type === 'image') {
    body = <img src={material.url} alt={material.title} className="max-w-full mx-auto rounded-xl" />;
  } else if (type === 'link') {
    body = (
      <div className="p-8 bg-slate-50 rounded-xl text-center">
        <p className="text-slate-600 mb-4">This lesson opens on another website.</p>
        <a href={material.externalUrl} target="_blank" rel="noopener noreferrer" className={btnClass}>Open link ↗</a>
      </div>
    );
  } else if (type === 'text') {
    body = <div className="max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap">{material.body}</div>;
  } else {
    body = (
      <div className="p-8 bg-slate-50 rounded-xl text-center">
        <p className="text-slate-700 font-semibold">{material.originalName || material.title}</p>
        <p className="text-slate-500 text-sm mt-1">{formatBytes(material.sizeBytes)}</p>
        <a href={material.downloadUrl || material.url} className={`${btnClass} mt-4`}>Open file</a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {body}
      {material.description && <p className="text-slate-600 whitespace-pre-line">{material.description}</p>}
      {download && type !== 'document' && <div>{download}</div>}
    </div>
  );
}
