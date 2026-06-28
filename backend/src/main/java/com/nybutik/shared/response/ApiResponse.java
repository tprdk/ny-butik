package com.nybutik.shared.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.Instant;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final T data;
    private final Instant timestamp;

    private ApiResponse(T data) {
        this.data = data;
        this.timestamp = Instant.now();
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data);
    }
}
