import React from 'react';
import Colors from './Colors.jsx';

const TextWithColor = ({ subject, text }) => {
  const color = Colors[subject.toLowerCase()];
  
  if (!color) {
    return <span>{text}</span>;
  }

  return <span style={{ color }}>{text}</span>;
};

export default TextWithColor;
