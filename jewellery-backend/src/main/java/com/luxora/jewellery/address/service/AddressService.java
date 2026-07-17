package com.luxora.jewellery.address.service;

import com.luxora.jewellery.address.dto.AddressDto;
import com.luxora.jewellery.address.dto.AddressRequest;
import com.luxora.jewellery.address.entity.Address;
import com.luxora.jewellery.address.mapper.AddressMapper;
import com.luxora.jewellery.address.repository.AddressRepository;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    public List<AddressDto> listForCurrentUser(String email) {
        UUID userId = resolveUserId(email);
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedDateDesc(userId).stream()
                .map(addressMapper::toDto)
                .toList();
    }

    @Transactional
    public AddressDto create(String email, AddressRequest request) {
        UUID userId = resolveUserId(email);

        Address address = Address.builder()
                .userId(userId)
                .label(request.label())
                .fullName(request.fullName())
                .phoneNumber(request.phoneNumber())
                .addressLine1(request.addressLine1())
                .addressLine2(request.addressLine2())
                .city(request.city())
                .state(request.state())
                .postalCode(request.postalCode())
                .country(StringUtils.hasText(request.country()) ? request.country() : "India")
                .isDefault(request.isDefault())
                .build();

        if (request.isDefault()) {
            unsetOtherDefaults(userId, null);
        }

        address = addressRepository.save(address);
        return addressMapper.toDto(address);
    }

    @Transactional
    public AddressDto update(String email, UUID addressId, AddressRequest request) {
        UUID userId = resolveUserId(email);
        Address address = findOwned(addressId, userId);

        address.setLabel(request.label());
        address.setFullName(request.fullName());
        address.setPhoneNumber(request.phoneNumber());
        address.setAddressLine1(request.addressLine1());
        address.setAddressLine2(request.addressLine2());
        address.setCity(request.city());
        address.setState(request.state());
        address.setPostalCode(request.postalCode());
        address.setCountry(StringUtils.hasText(request.country()) ? request.country() : "India");

        if (request.isDefault()) {
            unsetOtherDefaults(userId, address.getId());
            address.setDefault(true);
        } else {
            address.setDefault(false);
        }

        return addressMapper.toDto(address);
    }

    @Transactional
    public void delete(String email, UUID addressId) {
        UUID userId = resolveUserId(email);
        Address address = findOwned(addressId, userId);
        addressRepository.delete(address);
    }

    @Transactional
    public AddressDto setDefault(String email, UUID addressId) {
        UUID userId = resolveUserId(email);
        Address address = findOwned(addressId, userId);

        unsetOtherDefaults(userId, address.getId());
        address.setDefault(true);

        return addressMapper.toDto(address);
    }

    private void unsetOtherDefaults(UUID userId, UUID excludeAddressId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId).stream()
                .filter(a -> excludeAddressId == null || !a.getId().equals(excludeAddressId))
                .forEach(a -> a.setDefault(false));
    }

    private Address findOwned(UUID addressId, UUID userId) {
        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Address", "id", addressId));
    }

    private UUID resolveUserId(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ResourceNotFoundException.of("User", "email", email));
        return user.getId();
    }
}
