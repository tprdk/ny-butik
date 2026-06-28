package com.nybutik.module.user.service;

import com.nybutik.module.user.dto.request.AddressRequest;
import com.nybutik.module.user.dto.response.AddressResponse;
import com.nybutik.module.user.entity.Address;
import com.nybutik.module.user.entity.User;
import com.nybutik.module.user.mapper.UserMapper;
import com.nybutik.module.user.repository.AddressRepository;
import com.nybutik.shared.exception.BusinessException;
import com.nybutik.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private static final int MAX_ADDRESSES = 5;

    private final AddressRepository addressRepository;
    private final UserService userService;
    private final UserMapper userMapper;

    public List<AddressResponse> listAddresses(Long userId) {
        return addressRepository.findAllByUserIdOrderByIsDefaultDescCreatedAtAsc(userId)
                .stream()
                .map(userMapper::toAddressResponse)
                .toList();
    }

    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        if (addressRepository.countByUserId(userId) >= MAX_ADDRESSES) {
            throw new BusinessException("En fazla %d adres ekleyebilirsiniz.".formatted(MAX_ADDRESSES), HttpStatus.BAD_REQUEST);
        }

        User user = userService.findById(userId);

        if (request.isDefault()) {
            addressRepository.clearDefaultByUserId(userId);
        }

        Address address = buildAddress(request, user);
        return userMapper.toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = findByIdAndUserId(addressId, userId);

        if (request.isDefault() && !address.isDefault()) {
            addressRepository.clearDefaultByUserId(userId);
        }

        address.setLabel(request.label());
        address.setFirstName(request.firstName());
        address.setLastName(request.lastName());
        address.setPhone(request.phone());
        address.setAddressLine1(request.addressLine1());
        address.setAddressLine2(request.addressLine2());
        address.setCity(request.city());
        address.setDistrict(request.district());
        address.setPostalCode(request.postalCode());
        address.setDefault(request.isDefault());

        return userMapper.toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = findByIdAndUserId(addressId, userId);
        addressRepository.delete(address);
    }

    @Transactional
    public AddressResponse setDefault(Long userId, Long addressId) {
        findByIdAndUserId(addressId, userId);
        addressRepository.clearDefaultByUserId(userId);
        Address address = findByIdAndUserId(addressId, userId);
        address.setDefault(true);
        return userMapper.toAddressResponse(addressRepository.save(address));
    }

    public Address findByIdAndUserId(Long addressId, Long userId) {
        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Adres", addressId));
    }

    private Address buildAddress(AddressRequest req, User user) {
        return Address.builder()
                .user(user)
                .label(req.label())
                .firstName(req.firstName())
                .lastName(req.lastName())
                .phone(req.phone())
                .addressLine1(req.addressLine1())
                .addressLine2(req.addressLine2())
                .city(req.city())
                .district(req.district())
                .postalCode(req.postalCode())
                .country("TR")
                .isDefault(req.isDefault())
                .build();
    }
}
