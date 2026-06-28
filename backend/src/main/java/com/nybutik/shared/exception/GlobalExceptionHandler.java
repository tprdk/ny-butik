package com.nybutik.shared.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        List<Map<String, String>> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> Map.of("field", e.getField(), "message", defaultMessage(e)))
                .toList();

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.UNPROCESSABLE_ENTITY);
        problem.setType(URI.create("https://api.nybutik.com/errors/validation"));
        problem.setTitle("Validation Failed");
        problem.setDetail("İstek verileri geçersiz.");
        problem.setProperty("errors", errors);
        return ResponseEntity.unprocessableEntity().body(problem);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ProblemDetail> handleBusiness(BusinessException ex) {
        log.warn("Business exception: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatus(ex.getStatus());
        problem.setType(URI.create("https://api.nybutik.com/errors/business"));
        problem.setTitle(ex.getStatus().getReasonPhrase());
        problem.setDetail(ex.getMessage());
        if (ex.getErrorCode() != null) {
            problem.setProperty("errorCode", ex.getErrorCode());
        }
        return ResponseEntity.status(ex.getStatus()).body(problem);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetail> handleAuthentication(AuthenticationException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);
        problem.setType(URI.create("https://api.nybutik.com/errors/unauthorized"));
        problem.setTitle("Unauthorized");
        problem.setDetail("Kimlik doğrulama başarısız.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDenied(AccessDeniedException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
        problem.setType(URI.create("https://api.nybutik.com/errors/forbidden"));
        problem.setTitle("Forbidden");
        problem.setDetail("Bu işlem için yetkiniz bulunmamaktadır.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problem.setType(URI.create("https://api.nybutik.com/errors/internal"));
        problem.setTitle("Internal Server Error");
        problem.setDetail("Beklenmeyen bir hata oluştu.");
        return ResponseEntity.internalServerError().body(problem);
    }

    private String defaultMessage(FieldError error) {
        return error.getDefaultMessage() != null ? error.getDefaultMessage() : "Geçersiz değer";
    }
}
