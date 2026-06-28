package com.nybutik.module.user.mapper;

import com.nybutik.module.user.dto.response.AddressResponse;
import com.nybutik.module.user.dto.response.UserResponse;
import com.nybutik.module.user.entity.Address;
import com.nybutik.module.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "emailVerified", source = "emailVerified")
    UserResponse toUserResponse(User user);

    @Mapping(target = "isDefault", source = "default")
    AddressResponse toAddressResponse(Address address);
}
