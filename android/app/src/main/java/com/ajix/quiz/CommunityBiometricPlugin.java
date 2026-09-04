package com.ajix.quiz;

import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.concurrent.Executor;

@CapacitorPlugin(name = "CommunityBiometric")
public class CommunityBiometricPlugin extends Plugin {

    private static final int AUTHENTICATORS =
        BiometricManager.Authenticators.BIOMETRIC_STRONG |
        BiometricManager.Authenticators.BIOMETRIC_WEAK;

    private Executor executor;

    @Override
    public void load() {
        executor = ContextCompat.getMainExecutor(getContext());
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        call.resolve(buildAvailabilityPayload());
    }

    @PluginMethod
    public void authenticate(PluginCall call) {
        if (!(getActivity() instanceof FragmentActivity)) {
            call.reject("Biometric unlock is unavailable right now.");
            return;
        }

        int status = BiometricManager.from(getContext()).canAuthenticate(AUTHENTICATORS);
        if (status != BiometricManager.BIOMETRIC_SUCCESS) {
            call.reject(messageForStatus(status));
            return;
        }

        FragmentActivity activity = (FragmentActivity) getActivity();
        String title = fallback(call.getString("title"), "Unlock Community");
        String subtitle = fallback(call.getString("subtitle"), "Use face or fingerprint");
        String description = fallback(call.getString("description"), "");
        String negativeButtonText = fallback(call.getString("negativeButtonText"), "Cancel");

        activity.runOnUiThread(() -> {
            BiometricPrompt biometricPrompt = new BiometricPrompt(
                activity,
                executor,
                new BiometricPrompt.AuthenticationCallback() {
                    @Override
                    public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                        JSObject payload = new JSObject();
                        payload.put("verified", true);
                        call.resolve(payload);
                    }

                    @Override
                    public void onAuthenticationError(int errorCode, CharSequence errString) {
                        call.reject(String.valueOf(errString));
                    }

                    @Override
                    public void onAuthenticationFailed() {
                        // Keep the system prompt open so the user can try again.
                    }
                }
            );

            BiometricPrompt.PromptInfo.Builder builder = new BiometricPrompt.PromptInfo.Builder()
                .setTitle(title)
                .setSubtitle(subtitle)
                .setConfirmationRequired(false)
                .setNegativeButtonText(negativeButtonText)
                .setAllowedAuthenticators(AUTHENTICATORS);

            if (!description.isEmpty()) {
                builder.setDescription(description);
            }

            biometricPrompt.authenticate(builder.build());
        });
    }

    private JSObject buildAvailabilityPayload() {
        int status = BiometricManager.from(getContext()).canAuthenticate(AUTHENTICATORS);
        JSObject payload = new JSObject();
        payload.put("status", status);
        payload.put("supported", status != BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE);
        payload.put("available", status == BiometricManager.BIOMETRIC_SUCCESS);
        payload.put("enrolled", status != BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED);
        return payload;
    }

    private String fallback(String value, String fallbackValue) {
        String safeValue = value == null ? "" : value.trim();
        return safeValue.isEmpty() ? fallbackValue : safeValue;
    }

    private String messageForStatus(int status) {
        if (status == BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED) {
            return "No face or fingerprint is enrolled on this phone yet.";
        }
        if (status == BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE) {
            return "Face/Fingerprint unlock is temporarily unavailable.";
        }
        if (status == BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE) {
            return "Face/Fingerprint unlock is not available on this device.";
        }
        return "Face/Fingerprint unlock is unavailable right now.";
    }
}
