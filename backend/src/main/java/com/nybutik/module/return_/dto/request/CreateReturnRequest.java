package com.nybutik.module.return_.dto.request;

import com.nybutik.module.return_.enums.ReturnReason;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateReturnRequest(
        @NotNull Long orderId,
        @NotNull ReturnReason reason,
        String description,
        @NotNull @Size(min = 1) @Valid List<ReturnItemRequest> items
) {}
