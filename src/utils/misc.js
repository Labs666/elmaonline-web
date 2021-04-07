import config from 'config';
import { authToken } from 'utils/nick';

export const downloadWithAuth = async (path, filename, mime) => {
  const res = await fetch(`${config.dlUrl}${path}`, {
    method: 'GET',
    headers: {
      Authorization: authToken(),
    },
  });
  const blob = await res.blob();
  const zipBlob = new Blob([blob], { type: mime });
  const objectUrl = window.URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 250);
};

export const camelToTitleCase = text => {
  if (typeof text !== 'string') {
    return '';
  }
  const t = text.replace(/([A-Z])/g, ' $1').trim();
  return `${t.charAt(0).toUpperCase()}${t.slice(1)}`;
};

export const stripSpace = text => {
  if (typeof text === 'string') {
    return text.replace(/\s/g, '').trim();
  }
  return '';
};

export const alphaNumeric = text => {
  if (typeof text === 'string') {
    return text.replace(/[^0-9a-z]/gi, '');
  }
  return '';
};
