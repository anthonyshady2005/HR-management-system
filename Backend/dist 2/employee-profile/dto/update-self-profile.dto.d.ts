declare class AddressUpdateDto {
    city?: string;
    streetAddress?: string;
    country?: string;
}
export declare class UpdateSelfEmployeeProfileDto {
    mobilePhone?: string;
    personalEmail?: string;
    address?: AddressUpdateDto;
    biography?: string;
    profilePictureUrl?: string;
}
export {};
