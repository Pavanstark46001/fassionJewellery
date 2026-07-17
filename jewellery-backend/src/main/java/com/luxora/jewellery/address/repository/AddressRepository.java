package com.luxora.jewellery.address.repository;

import com.luxora.jewellery.address.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByUserIdOrderByIsDefaultDescCreatedDateDesc(UUID userId);

    Optional<Address> findByIdAndUserId(UUID id, UUID userId);

    List<Address> findByUserIdAndIsDefaultTrue(UUID userId);
}
