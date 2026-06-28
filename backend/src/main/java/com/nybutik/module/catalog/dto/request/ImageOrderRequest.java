package com.nybutik.module.catalog.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ImageOrderRequest(@NotNull List<Long> imageIds) {}
