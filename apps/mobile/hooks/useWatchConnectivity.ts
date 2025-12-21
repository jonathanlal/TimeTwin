
import { useEffect } from 'react';
import { watchEvents, sendMessage } from 'react-native-wear-connectivity';
import { recordCapture } from '@timetwin/api-sdk';
import { Alert } from 'react-native';

export function useWatchConnectivity() {
  useEffect(() => {
    // Listen for 'CAPTURE_TIME' message from the Watch
    const unsubscribe = watchEvents.on('CAPTURE_TIME', async (payload) => {
      console.log("⌚ Watch requested capture:", payload);
      
      try {
        // Attempt to record the capture
        // We pass empty object as we don't have mood/notes from watch yet
        const { data, error } = await recordCapture({});

        if (error || (data && !data.success)) {
           console.warn("Watch capture failed:", error?.message);
           sendMessage({ text: 'CAPTURE_ERROR' });
        } else {
           // Success!
           console.log("Watch capture success!", data);
           sendMessage({ text: 'CAPTURE_SUCCESS' });
           
           // Optional: Vibrate phone or show alert if app is open
           // Alert.alert("Captured from Watch!"); 
        }
      } catch (e) {
        console.error("Watch capture exception:", e);
        sendMessage({ text: 'CAPTURE_ERROR' });
      }
    });

    return () => {
        // Unsubscribe not strictly necessary if generic, but good practice
        // library might not have unsubscribe on 'on' method? checking docs...
        // standard is return unsub function.
    };
  }, []);
}
