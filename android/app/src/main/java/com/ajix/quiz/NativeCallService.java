package com.ajix.quiz;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;
import java.util.concurrent.TimeUnit;
import org.json.JSONException;
import org.json.JSONObject;

public class NativeCallService extends Service {

    public static final String ACTION_START_OUTGOING = "com.ajix.quiz.nativecall.START_OUTGOING";
    public static final String ACTION_PRESENT_INCOMING = "com.ajix.quiz.nativecall.PRESENT_INCOMING";
    public static final String ACTION_SET_STATE = "com.ajix.quiz.nativecall.SET_STATE";
    public static final String ACTION_END = "com.ajix.quiz.nativecall.END";
    public static final String ACTION_NOTIFY_OPEN = "com.ajix.quiz.nativecall.NOTIFY_OPEN";
    public static final String ACTION_NOTIFY_ANSWER = "com.ajix.quiz.nativecall.NOTIFY_ANSWER";
    public static final String ACTION_NOTIFY_DECLINE = "com.ajix.quiz.nativecall.NOTIFY_DECLINE";
    public static final String ACTION_NOTIFY_END = "com.ajix.quiz.nativecall.NOTIFY_END";
    public static final String ACTION_NOTIFY_TOGGLE_MUTE = "com.ajix.quiz.nativecall.NOTIFY_TOGGLE_MUTE";
    public static final String ACTION_NOTIFY_TOGGLE_SPEAKER = "com.ajix.quiz.nativecall.NOTIFY_TOGGLE_SPEAKER";

    public static final String EXTRA_CALL_ID = "callId";
    public static final String EXTRA_CONVERSATION_ID = "conversationId";
    public static final String EXTRA_CALLER_NAME = "callerName";
    public static final String EXTRA_MODE = "mode";
    public static final String EXTRA_STATE = "state";
    public static final String EXTRA_MUTED = "muted";
    public static final String EXTRA_SPEAKER = "speakerOn";
    public static final String EXTRA_IS_INCOMING = "incoming";
    public static final String EXTRA_CONNECTED_AT_MS = "connectedAtMs";

    public static final String EVENT_ACTION = "com.ajix.quiz.nativecall.EVENT";
    public static final String EVENT_NAME_KEY = "event";
    public static final String EVENT_PAYLOAD_KEY = "payload";

    private static final String CHANNEL_ID_CALLS = "ajix_calls";
    private static final int NOTIFICATION_ID_CALL = 91234;

    private final Object lock = new Object();

    private String callId = "";
    private String conversationId = "";
    private String callerName = "Contact";
    private String mode = "voice";
    private String state = "idle";
    private boolean muted = false;
    private boolean speakerOn = true;
    private boolean incoming = false;
    private long connectedAtMs = 0L;

    private NotificationManager notificationManager;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private Ringtone ringtone;
    private Vibrator vibrator;
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        ensureNotificationChannel();
        acquireCallWakeLock();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        final String action = intent == null ? "" : safe(intent.getAction());
        switch (action) {
            case ACTION_START_OUTGOING:
                handleStartOutgoing(intent);
                break;
            case ACTION_PRESENT_INCOMING:
                handlePresentIncoming(intent);
                break;
            case ACTION_SET_STATE:
                handleSetState(intent);
                break;
            case ACTION_NOTIFY_OPEN:
                handleNotifyOpen();
                break;
            case ACTION_NOTIFY_ANSWER:
                handleNotifyAnswer();
                break;
            case ACTION_NOTIFY_DECLINE:
                handleNotifyDecline();
                break;
            case ACTION_NOTIFY_END:
            case ACTION_END:
                handleNotifyEnd();
                break;
            case ACTION_NOTIFY_TOGGLE_MUTE:
                handleNotifyToggleMute();
                break;
            case ACTION_NOTIFY_TOGGLE_SPEAKER:
                handleNotifyToggleSpeaker();
                break;
            default:
                refreshForegroundNotification();
                break;
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        stopRinging();
        stopVibration();
        releaseAudioRouting();
        releaseCallWakeLock();
        stopForeground(true);
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void handleStartOutgoing(Intent intent) {
        synchronized (lock) {
            callId = pickId(intent, EXTRA_CALL_ID);
            conversationId = safe(intent.getStringExtra(EXTRA_CONVERSATION_ID));
            callerName = fallback(intent.getStringExtra(EXTRA_CALLER_NAME), "Contact");
            mode = normalizeMode(intent.getStringExtra(EXTRA_MODE));
            incoming = false;
            state = "outgoing";
            muted = false;
            speakerOn = true;
            connectedAtMs = 0L;
            requestAudioRouting();
        }
        dispatchEvent("outgoing-presented", statusPayload());
        refreshForegroundNotification();
    }

    private void handlePresentIncoming(Intent intent) {
        synchronized (lock) {
            callId = pickId(intent, EXTRA_CALL_ID);
            conversationId = safe(intent.getStringExtra(EXTRA_CONVERSATION_ID));
            callerName = fallback(intent.getStringExtra(EXTRA_CALLER_NAME), "Contact");
            mode = normalizeMode(intent.getStringExtra(EXTRA_MODE));
            incoming = true;
            state = "incoming";
            muted = false;
            speakerOn = true;
            connectedAtMs = 0L;
        }
        startRinging();
        startVibration();
        dispatchEvent("incoming-presented", statusPayload());
        refreshForegroundNotification();
    }

    private void handleSetState(Intent intent) {
        synchronized (lock) {
            String nextState = safe(intent.getStringExtra(EXTRA_STATE));
            if (!nextState.isEmpty()) {
                state = nextState;
            }
            if (intent.hasExtra(EXTRA_MUTED)) {
                muted = intent.getBooleanExtra(EXTRA_MUTED, muted);
            }
            if (intent.hasExtra(EXTRA_SPEAKER)) {
                speakerOn = intent.getBooleanExtra(EXTRA_SPEAKER, speakerOn);
            }
            if (intent.hasExtra(EXTRA_IS_INCOMING)) {
                incoming = intent.getBooleanExtra(EXTRA_IS_INCOMING, incoming);
            }
            if (intent.hasExtra(EXTRA_CONNECTED_AT_MS)) {
                long value = intent.getLongExtra(EXTRA_CONNECTED_AT_MS, 0L);
                connectedAtMs = value > 0 ? value : connectedAtMs;
            }
            if ("connected".equals(state) && connectedAtMs <= 0) {
                connectedAtMs = System.currentTimeMillis();
            }
            if (isEndingState(state)) {
                stopRinging();
                stopVibration();
                clearAndStop();
                return;
            }
            if ("incoming".equals(state) || "outgoing".equals(state)) {
                if ("incoming".equals(state)) {
                    startRinging();
                    startVibration();
                } else {
                    stopRinging();
                    stopVibration();
                }
            } else {
                stopRinging();
                stopVibration();
                requestAudioRouting();
            }
        }
        refreshForegroundNotification();
    }

    private void handleNotifyOpen() {
        dispatchEvent("open", statusPayload());
        openMainActivity();
        refreshForegroundNotification();
    }

    private void handleNotifyAnswer() {
        synchronized (lock) {
            incoming = false;
            state = "connecting";
            stopRinging();
            stopVibration();
            requestAudioRouting();
        }
        dispatchEvent("answer", statusPayload());
        openMainActivity();
        refreshForegroundNotification();
    }

    private void handleNotifyDecline() {
        dispatchEvent("decline", statusPayload());
        clearAndStop();
    }

    private void handleNotifyEnd() {
        dispatchEvent("end", statusPayload());
        clearAndStop();
    }

    private void handleNotifyToggleMute() {
        synchronized (lock) {
            muted = !muted;
        }
        dispatchEvent("toggle-mute", statusPayload());
        refreshForegroundNotification();
    }

    private void handleNotifyToggleSpeaker() {
        synchronized (lock) {
            speakerOn = !speakerOn;
        }
        dispatchEvent("toggle-speaker", statusPayload());
        refreshForegroundNotification();
    }

    private void ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || notificationManager == null) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID_CALLS,
            "Calls",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Incoming and ongoing call controls.");
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        notificationManager.createNotificationChannel(channel);
    }

    private void refreshForegroundNotification() {
        Notification notification = buildNotification();
        startForeground(NOTIFICATION_ID_CALL, notification);
    }

    private Notification buildNotification() {
        JSONObject status = statusPayload();
        String safeState = safe(status.optString("state"));
        boolean isIncoming = "incoming".equals(safeState);
        boolean isActive = "connected".equals(safeState);
        String title = fallback(status.optString("callerName"), "Contact");
        String body = buildBodyText(status);

        Intent openIntent = new Intent(this, NativeCallService.class);
        openIntent.setAction(ACTION_NOTIFY_OPEN);
        openIntent.putExtra(EXTRA_CALL_ID, callId);
        PendingIntent openPendingIntent = PendingIntent.getService(
            this,
            requestCode("open"),
            openIntent,
            pendingFlags()
        );

        Intent fullscreenIntent = new Intent(this, MainActivity.class);
        fullscreenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        fullscreenIntent.putExtra("nativeCallAction", "open");
        fullscreenIntent.putExtra(EXTRA_CALL_ID, callId);
        fullscreenIntent.putExtra(EXTRA_CONVERSATION_ID, conversationId);
        PendingIntent fullscreenPendingIntent = PendingIntent.getActivity(
            this,
            requestCode("fullscreen"),
            fullscreenIntent,
            pendingFlags()
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID_CALLS)
            .setSmallIcon(android.R.drawable.stat_sys_phone_call)
            .setContentTitle(title)
            .setContentText(body)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(!isIncoming)
            .setOnlyAlertOnce(!isIncoming)
            .setPriority(isIncoming ? NotificationCompat.PRIORITY_MAX : NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(openPendingIntent)
            .setAutoCancel(false);

        if (isIncoming) {
            builder.setFullScreenIntent(fullscreenPendingIntent, true);
            builder.addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Decline",
                servicePendingIntent(ACTION_NOTIFY_DECLINE, "decline")
            );
            builder.addAction(
                android.R.drawable.ic_menu_call,
                "Answer",
                servicePendingIntent(ACTION_NOTIFY_ANSWER, "answer")
            );
        } else {
            builder.addAction(
                muted ? android.R.drawable.ic_lock_silent_mode : android.R.drawable.ic_lock_silent_mode_off,
                muted ? "Unmute" : "Mute",
                servicePendingIntent(ACTION_NOTIFY_TOGGLE_MUTE, "mute")
            );
            builder.addAction(
                speakerOn ? android.R.drawable.ic_lock_silent_mode_off : android.R.drawable.ic_lock_silent_mode,
                speakerOn ? "Speaker on" : "Speaker off",
                servicePendingIntent(ACTION_NOTIFY_TOGGLE_SPEAKER, "speaker")
            );
            builder.addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Hang up",
                servicePendingIntent(ACTION_NOTIFY_END, "end")
            );
        }

        if (isActive && connectedAtMs > 0) {
            builder.setUsesChronometer(true);
            builder.setWhen(connectedAtMs);
        } else {
            builder.setUsesChronometer(false);
            builder.setWhen(System.currentTimeMillis());
        }

        return builder.build();
    }

    private PendingIntent servicePendingIntent(String action, String requestKey) {
        Intent intent = new Intent(this, NativeCallService.class);
        intent.setAction(action);
        intent.putExtra(EXTRA_CALL_ID, callId);
        return PendingIntent.getService(this, requestCode(requestKey), intent, pendingFlags());
    }

    private int requestCode(String suffix) {
        return Math.abs((callId + ":" + suffix).hashCode());
    }

    private int pendingFlags() {
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return flags;
    }

    private String buildBodyText(JSONObject status) {
        String safeState = safe(status.optString("state"));
        if ("incoming".equals(safeState)) {
            return "Incoming " + ("video".equals(mode) ? "video" : "voice") + " call";
        }
        if ("outgoing".equals(safeState)) {
            return "Ringing...";
        }
        if ("connecting".equals(safeState)) {
            return "Connecting...";
        }
        if ("reconnecting".equals(safeState)) {
            return "Reconnecting...";
        }
        if ("connected".equals(safeState)) {
            long elapsed = connectedAtMs > 0 ? Math.max(0L, System.currentTimeMillis() - connectedAtMs) : 0L;
            return "In call • " + formatElapsed(elapsed);
        }
        return fallback(safeState, "Call in progress");
    }

    private String formatElapsed(long elapsedMs) {
        long totalSeconds = TimeUnit.MILLISECONDS.toSeconds(Math.max(0L, elapsedMs));
        long hours = totalSeconds / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        long seconds = totalSeconds % 60;
        if (hours > 0) {
            return String.format("%02d:%02d:%02d", hours, minutes, seconds);
        }
        return String.format("%02d:%02d", minutes, seconds);
    }

    private void startRinging() {
        stopRinging();
        try {
            Uri uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            if (uri == null) {
                uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }
            ringtone = RingtoneManager.getRingtone(getApplicationContext(), uri);
            if (ringtone != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    ringtone.setLooping(true);
                }
                ringtone.play();
            }
        } catch (Exception ignored) {}
    }

    private void stopRinging() {
        try {
            if (ringtone != null && ringtone.isPlaying()) {
                ringtone.stop();
            }
        } catch (Exception ignored) {}
        ringtone = null;
    }

    private void startVibration() {
        if (vibrator == null || !vibrator.hasVibrator()) return;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                long[] pattern = new long[] {0, 350, 200, 350};
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
            } else {
                vibrator.vibrate(new long[] {0, 350, 200, 350}, 0);
            }
        } catch (Exception ignored) {}
    }

    private void stopVibration() {
        if (vibrator == null) return;
        try {
            vibrator.cancel();
        } catch (Exception ignored) {}
    }

    private void requestAudioRouting() {
        if (audioManager == null) return;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();
                audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                    .setAudioAttributes(attrs)
                    .setAcceptsDelayedFocusGain(true)
                    .build();
                audioManager.requestAudioFocus(audioFocusRequest);
            } else {
                audioManager.requestAudioFocus(null, AudioManager.STREAM_VOICE_CALL, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
            }
        } catch (Exception ignored) {}
        try {
            audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
            audioManager.setSpeakerphoneOn(speakerOn);
        } catch (Exception ignored) {}
    }

    private void releaseAudioRouting() {
        if (audioManager == null) return;
        try {
            audioManager.setSpeakerphoneOn(false);
            audioManager.setMode(AudioManager.MODE_NORMAL);
        } catch (Exception ignored) {}
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
                audioManager.abandonAudioFocusRequest(audioFocusRequest);
            } else {
                audioManager.abandonAudioFocus(null);
            }
        } catch (Exception ignored) {}
        audioFocusRequest = null;
    }

    private void dispatchEvent(String event, JSONObject payload) {
        JSONObject safePayload = payload == null ? new JSONObject() : payload;
        Intent eventIntent = new Intent(EVENT_ACTION);
        eventIntent.putExtra(EVENT_NAME_KEY, event);
        eventIntent.putExtra(EVENT_PAYLOAD_KEY, safePayload.toString());
        sendBroadcast(eventIntent);
        NativeCallStore.enqueuePendingAction(getApplicationContext(), event, safePayload);
    }

    private void clearAndStop() {
        NativeCallStore.clearStatus(getApplicationContext());
        stopRinging();
        stopVibration();
        releaseAudioRouting();
        stopForeground(true);
        stopSelf();
    }

    private JSONObject statusPayload() {
        JSONObject payload = new JSONObject();
        try {
            payload.put("callId", callId);
            payload.put("conversationId", conversationId);
            payload.put("callerName", callerName);
            payload.put("mode", mode);
            payload.put("state", state);
            payload.put("incoming", incoming);
            payload.put("muted", muted);
            payload.put("speakerOn", speakerOn);
            payload.put("connectedAtMs", connectedAtMs);
            payload.put("timestampMs", System.currentTimeMillis());
        } catch (JSONException ignored) {}
        NativeCallStore.saveStatus(getApplicationContext(), payload);
        return payload;
    }

    private boolean isEndingState(String value) {
        String safeValue = safe(value);
        return "ended".equals(safeValue) || "failed".equals(safeValue) || "idle".equals(safeValue);
    }

    private void openMainActivity() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        intent.putExtra("nativeCallAction", "open");
        intent.putExtra(EXTRA_CALL_ID, callId);
        intent.putExtra(EXTRA_CONVERSATION_ID, conversationId);
        startActivity(intent);
    }

    private void acquireCallWakeLock() {
        try {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager == null) return;
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ajix:native-call");
            wakeLock.setReferenceCounted(false);
            wakeLock.acquire(10 * 60 * 1000L);
        } catch (Exception ignored) {}
    }

    private void releaseCallWakeLock() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Exception ignored) {}
        wakeLock = null;
    }

    private String pickId(Intent intent, String key) {
        String incomingId = safe(intent.getStringExtra(key));
        if (!incomingId.isEmpty()) return incomingId;
        return String.valueOf(System.currentTimeMillis());
    }

    private String normalizeMode(String value) {
        return "video".equals(safe(value)) ? "video" : "voice";
    }

    private String safe(String value) {
        return NativeCallStore.safe(value);
    }

    private String fallback(String value, String fallbackValue) {
        String safeValue = safe(value);
        return safeValue.isEmpty() ? fallbackValue : safeValue;
    }
}
