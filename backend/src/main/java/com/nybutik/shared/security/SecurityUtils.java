package com.nybutik.shared.security;

import com.nybutik.shared.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserPrincipal currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BusinessException("Kimlik doğrulama gereklidir.", HttpStatus.UNAUTHORIZED);
        }
        return principal;
    }

    public static Long currentUserId() {
        return currentUser().id();
    }
}
