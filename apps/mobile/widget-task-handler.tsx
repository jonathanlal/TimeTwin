import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { CaptureWidget } from './src/widgets/CaptureWidget';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(<CaptureWidget />);
      break;

    case 'WIDGET_CLICK':
      // Click is handled by OPEN_URI in the widget itself
      break;

    default:
      break;
  }
}
