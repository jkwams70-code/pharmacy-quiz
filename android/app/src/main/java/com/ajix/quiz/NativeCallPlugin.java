package com.ajix.quiz;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "NativeCall")
public class NativeCallPlugin extends Plugin {

    private BroadcastReceiver nativeCallEventReceiver;

    @Override
    public void load() {
        nativeCallEventReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null || !NativeCallService.EVENT_ACTION.equals(intent.getAction())) return;
                String eventName = NativeCallStore.safe(intent.getStringExtra(NativeCallService.EVENT_NAME_KEY));
                String rawPayload = intent.getStringExtra(NativeCallService.EVENT_PAYLOAD_KEY);
                JSObject payload = new JSObject();
                payload.put("event", eventName);
                payload.put("payload", parsePayload(rawPayload));
                notifyListeners("nativeCallAction", payload, true);
            }
        };
        registerNativeCallEventReceiver();
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (nativeCallEventReceiver != null) {
            try {
                getContext().unregisterReceiver(nativeCallEventReceiver);
            } catch (Exception ignored) {}
            nativeCallEventReceiver = null;
        }
    }

    @PluginMethod
    public void startOutgoing(PluginCall call) {
        Intent intent = buildServiceIntent(NativeCallService.ACTION_START_OUTGOING, call);
        ContextCompat.startForegroundService(getContext(), intent);
        call.resolve(buildStatusPayload());
    }

    @PluginMethod
    public void presentIncoming(PluginCall call) {
        Intent intent = buildServiceIntent(NativeCallService.ACTION_PRESENT_INCOMING, call);
        ContextCompat.startForegroundService(getContext(), intent);
        call.resolve(buildStatusPayload());
    }

    @PluginMethod
    public void setState(PluginCall call) {
        Intent intent = buildServiceIntent(NativeCallService.ACTION_SET_STATE, call);
        ContextCompat.startForegroundService(getContext(), intent);
        call.resolve(buildStatusPayload());
    }

    @PluginMethod
    public void endCall(PluginCall call) {
        Intent intent = new Intent(getContext(), NativeCallService.class);
        intent.setAction(NativeCallService.ACTION_END);
        ContextCompat.startForegroundService(getContext(), intent);
        call.resolve(buildStatusPayload());
    }

    @PluginMethod
    public void openCallScreen(PluginCall call) {
        Intent intent = new Intent(getContext(), NativeCallService.class);
        intent.setAction(NativeCallService.ACTION_NOTIFY_OPEN);
        ContextCompat.startForegroundService(getContext(), intent);
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        call.resolve(buildStatusPayload());
    }

    @PluginMethod
    public void drainPendingActions(PluginCall call) {
        JSONArray pending = NativeCallStore.drainPendingActions(getContext());
        JSArray actions = new JSArray();
        for (int i = 0; i < pending.length(); i++) {
            JSONObject item = pending.optJSONObject(i);
            if (item != null) {
                actions.put(jsonToJsObject(item));
            }
        }
        JSObject result = new JSObject();
        result.put("actions", actions);
        call.resolve(result);
    }

    @PluginMethod
    public void isIgnoringBatteryOptimizations(PluginCall call) {
        boolean ignoring = false;
        try {
            PowerManager powerManager = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                ignoring = powerManager.isIgnoringBatteryOptimizations(getContext().getPackageName());
            }
        } catch (Exception ignored) {}
        JSObject payload = new JSObject();
        payload.put("ignoring", ignoring);
        call.resolve(payload);
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimizations(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(android.net.Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject("Could not open battery optimization settings.");
        }
    }

    private Intent buildServiceIntent(String action, PluginCall call) {
        Intent intent = new Intent(getContext(), NativeCallService.class);
        intent.setAction(action);
        putStringExtra(intent, NativeCallService.EXTRA_CALL_ID, call.getString("callId"));
        putStringExtra(intent, NativeCallService.EXTRA_CONVERSATION_ID, call.getString("conversationId"));
        putStringExtra(intent, NativeCallService.EXTRA_CALLER_NAME, call.getString("callerName"));
        putStringExtra(intent, NativeCallService.EXTRA_MODE, call.getString("mode"));
        putStringExtra(intent, NativeCallService.EXTRA_STATE, call.getString("state"));
        if (call.hasOption("muted")) {
            intent.putExtra(NativeCallService.EXTRA_MUTED, call.getBoolean("muted", false));
        }
        if (call.hasOption("speakerOn")) {
            intent.putExtra(NativeCallService.EXTRA_SPEAKER, call.getBoolean("speakerOn", true));
        }
        if (call.hasOption("incoming")) {
            intent.putExtra(NativeCallService.EXTRA_IS_INCOMING, call.getBoolean("incoming", false));
        }
        if (call.hasOption("connectedAtMs")) {
            double connectedAtMs = call.getDouble("connectedAtMs", 0d);
            intent.putExtra(NativeCallService.EXTRA_CONNECTED_AT_MS, Math.max(0L, Math.round(connectedAtMs)));
        }
        return intent;
    }

    private void putStringExtra(Intent intent, String key, String value) {
        String safe = NativeCallStore.safe(value);
        if (!safe.isEmpty()) {
            intent.putExtra(key, safe);
        }
    }

    private JSObject buildStatusPayload() {
        JSONObject status = NativeCallStore.getStatus(getContext());
        JSObject payload = new JSObject();
        payload.put("status", jsonToJsObject(status));
        return payload;
    }

    private JSObject parsePayload(String rawPayload) {
        if (rawPayload == null || rawPayload.trim().isEmpty()) {
            return new JSObject();
        }
        try {
            return jsonToJsObject(new JSONObject(rawPayload));
        } catch (JSONException ignored) {
            return new JSObject();
        }
    }

    private JSObject jsonToJsObject(JSONObject source) {
        JSObject output = new JSObject();
        if (source == null) return output;
        JSONArray names = source.names();
        if (names == null) return output;
        for (int i = 0; i < names.length(); i++) {
            String key = names.optString(i, "");
            Object value = source.opt(key);
            if (value == null || value == JSONObject.NULL) {
                output.put(key, null);
            } else if (value instanceof JSONObject) {
                output.put(key, jsonToJsObject((JSONObject) value));
            } else if (value instanceof JSONArray) {
                output.put(key, jsonArrayToJsArray((JSONArray) value));
            } else {
                output.put(key, value);
            }
        }
        return output;
    }

    private JSArray jsonArrayToJsArray(JSONArray source) {
        JSArray output = new JSArray();
        if (source == null) return output;
        for (int i = 0; i < source.length(); i++) {
            Object value = source.opt(i);
            if (value instanceof JSONObject) {
                output.put(jsonToJsObject((JSONObject) value));
            } else if (value instanceof JSONArray) {
                output.put(jsonArrayToJsArray((JSONArray) value));
            } else {
                output.put(value);
            }
        }
        return output;
    }

    private void registerNativeCallEventReceiver() {
        if (nativeCallEventReceiver == null) return;
        IntentFilter filter = new IntentFilter(NativeCallService.EVENT_ACTION);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getContext().registerReceiver(nativeCallEventReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(nativeCallEventReceiver, filter);
        }
    }
}
