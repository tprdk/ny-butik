package com.nybutik.shared.logging;

import ch.qos.logback.classic.pattern.ClassicConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;

import java.util.regex.Pattern;

public class SensitiveDataMaskingConverter extends ClassicConverter {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("([a-zA-Z0-9._%+\\-]+)@([a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,})", Pattern.CASE_INSENSITIVE);

    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("\"(password|passwordHash|currentPassword|newPassword)\"\\s*:\\s*\"[^\"]*\"", Pattern.CASE_INSENSITIVE);

    private static final Pattern TOKEN_PATTERN =
            Pattern.compile("\"(token|accessToken|refreshToken)\"\\s*:\\s*\"[^\"]{10,}\"", Pattern.CASE_INSENSITIVE);

    @Override
    public String convert(ILoggingEvent event) {
        String message = event.getFormattedMessage();
        message = EMAIL_PATTERN.matcher(message).replaceAll(m -> maskEmail(m.group()));
        message = PASSWORD_PATTERN.matcher(message).replaceAll(m -> "\"" + extractKey(m.group()) + "\":\"***\"");
        message = TOKEN_PATTERN.matcher(message).replaceAll(m -> "\"" + extractKey(m.group()) + "\":\"***\"");
        return message;
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) return "***@" + email.substring(at + 1);
        return email.charAt(0) + "***@" + email.substring(at + 1);
    }

    private String extractKey(String match) {
        int colon = match.indexOf(':');
        return match.substring(1, colon).trim().replace("\"", "");
    }
}
