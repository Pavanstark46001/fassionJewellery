package com.luxora.jewellery.address.mapper;

import com.luxora.jewellery.address.dto.AddressDto;
import com.luxora.jewellery.address.entity.Address;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    @Mapping(target = "isDefault", source = "default")
    AddressDto toDto(Address address);
}
