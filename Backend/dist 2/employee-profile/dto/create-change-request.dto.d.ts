export declare class FieldChangeDto {
    fieldName: string;
    oldValue: any;
    newValue: any;
}
export declare class CreateChangeRequestDto {
    fields: FieldChangeDto[];
    reason: string;
}
