package com.ajix.quiz;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

final class NativeCallStore {

    static final String PREFS_NAME = "ajix_native_call_store";
    private static final String KEY_STATUS = "status";
    private static final String KEY_PENDING_ACTIONS = "pending_actions";
    private static final int MAX_PENDING_ACTIONS = 30;

    private NativeCallStore() {}

    static synchronized void saveStatus(Context context, JSONObject status) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_STATUS, status == null ? "{}" : status.toString()).apply();
    }

    static synchronized JSONObject getStatus(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(KEY_STATUS, "{}");
        try {
            return new JSONObject(raw == null ? "{}" : raw);
        } catch (JSONException ignored) {
            return new JSONObject();
        }
    }

    static synchronized void clearStatus(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_STATUS, "{}").apply();
    }

    static synchronized void enqueuePendingAction(Context context, String event, JSONObject payload) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        JSONArray actions = parseJsonArray(prefs.getString(KEY_PENDING_ACTIONS, "[]"));
        JSONObject entry = new JSONObject();
        try {
            entry.put("event", safe(event));
            entry.put("at", System.currentTimeMillis());
            entry.put("payload", payload == null ? new JSONObject() : payload);
            actions.put(entry);
            while (actions.length() > MAX_PENDING_ACTIONS) {
                JSONArray trimmed = new JSONArray();
                for (int i = 1; i < actions.length(); i++) {
                    trimmed.put(actions.opt(i));
                }
                actions = trimmed;
            }
            prefs.edit().putString(KEY_PENDING_ACTIONS, actions.toString()).apply();
        } catch (JSONException ignored) {}
    }

    static synchronized JSONArray drainPendingActions(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        JSONArray actions = parseJsonArray(prefs.getString(KEY_PENDING_ACTIONS, "[]"));
        prefs.edit().putString(KEY_PENDING_ACTIONS, "[]").apply();
        return actions;
    }

    static String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private static JSONArray parseJsonArray(String raw) {
        try {
            return new JSONArray(raw == null ? "[]" : raw);
        } catch (JSONException ignored) {
            return new JSONArray();
        }
    }

}
