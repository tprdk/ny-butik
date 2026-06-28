package com.nybutik.module.user.service;

import com.nybutik.module.user.dto.request.ChangePasswordRequest;
import com.nybutik.module.user.dto.request.UpdateProfileRequest;
import com.nybutik.module.user.dto.response.UserResponse;
import com.nybutik.module.user.entity.User;
import com.nybutik.module.user.mapper.UserMapper;
import com.nybutik.module.user.repository.UserRepository;
import com.nybutik.shared.exception.BusinessException;
import com.nybutik.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserResponse getProfile(Long userId) {
        return userMapper.toUserResponse(findById(userId));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findById(userId);
        user.setFirstName(request.firstName().strip());
        user.setLastName(request.lastName().strip());
        user.setPhone(request.phone());
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findById(userId);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Mevcut şifre hatalı.", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deactivateAccount(Long userId) {
        User user = findById(userId);
        user.setActive(false);
        userRepository.save(user);
    }

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı", userId));
    }
}
