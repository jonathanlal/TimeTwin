import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function CaptureWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0D0F12',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'timetwin://capture' }}
    >
      <TextWidget
        text="+"
        style={{
          fontSize: 48,
          color: '#ffffff',
          fontWeight: 'bold',
        }}
      />
      <TextWidget
        text="Capture"
        style={{
          fontSize: 12,
          color: '#aaaaaa',
          marginTop: 4,
        }}
      />
    </FlexWidget>
  );
}
