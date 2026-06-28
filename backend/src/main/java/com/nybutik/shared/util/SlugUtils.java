package com.nybutik.shared.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTI_DASH = Pattern.compile("-{2,}");

    private static final String[][] TR_CHARS = {
            {"ş", "s"}, {"Ş", "s"}, {"ı", "i"}, {"İ", "i"},
            {"ğ", "g"}, {"Ğ", "g"}, {"ç", "c"}, {"Ç", "c"},
            {"ö", "o"}, {"Ö", "o"}, {"ü", "u"}, {"Ü", "u"}
    };

    private SlugUtils() {}

    public static String toSlug(String input) {
        String value = input.toLowerCase(Locale.ENGLISH);
        for (String[] pair : TR_CHARS) {
            value = value.replace(pair[0], pair[1]);
        }
        value = Normalizer.normalize(value, Normalizer.Form.NFD);
        value = WHITESPACE.matcher(value).replaceAll("-");
        value = NON_LATIN.matcher(value).replaceAll("");
        value = MULTI_DASH.matcher(value).replaceAll("-");
        return value.strip();
    }
}
