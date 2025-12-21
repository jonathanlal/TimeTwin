import "expo-router/entry";
import { AppRegistry } from 'react-native';
import { widgetTaskHandler } from './widget-task-handler';

AppRegistry.registerHeadlessTask('WidgetTaskHandler', () => widgetTaskHandler);
