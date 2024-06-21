import React from 'react';
import Colors from './Colors.jsx';

const TextWithColor = ({ subject, text, color }) => {
  const colorStyle = Colors[subject.toLowerCase()];

  if (!color) {
    return <span>{text}</span>;
  }

  if (color.startsWith('linear-gradient')) {
    return <span style={{ background: color, WebkitBackgroundClip: 'text', color: 'transparent' }}>{text}</span>;
  }

  return <span style={{ color }}>{text}</span>;
};

export default TextWithColor;
