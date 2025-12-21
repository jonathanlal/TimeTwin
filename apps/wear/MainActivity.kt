package com.timetwin.watch

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                WearApp(onCapture = { sendCaptureMessage() })
            }
        }
    }

    private fun sendCaptureMessage() {
        lifecycleScope.launch {
            try {
                // 1. Get connection to Phone
                val nodeClient = Wearable.getNodeClient(this@MainActivity)
                val nodes = nodeClient.connectedNodes.await()
                
                if (nodes.isEmpty()) {
                    Toast.makeText(this@MainActivity, "Phone disconnected 🚫", Toast.LENGTH_SHORT).show()
                    return@launch
                }

                // 2. Send 'CAPTURE_TIME' signal to all connected nodes
                val messageClient = Wearable.getMessageClient(this@MainActivity)
                var sentCount = 0
                nodes.forEach { node ->
                    messageClient.sendMessage(node.id, "CAPTURE_TIME", "TimeTwin Capture".toByteArray()).await()
                    sentCount++
                }
                
                if (sentCount > 0) {
                    Toast.makeText(this@MainActivity, "Capture Sent! ✨", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Toast.makeText(this@MainActivity, "Failed to send", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

@Composable
fun WearApp(onCapture: () -> Unit) {
    Scaffold(
        timeText = { TimeText() }
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = "TimeTwin", color = Color.Cyan, modifier = Modifier.padding(bottom = 8.dp))
            
            Button(
                onClick = onCapture,
                colors = ButtonDefaults.primaryButtonColors(backgroundColor = Color(0xFF6200EE)),
                modifier = Modifier.padding(8.dp)
            ) {
                Text("CAPTURE")
            }
        }
    }
}
