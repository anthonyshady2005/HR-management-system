import { TerminationInitiation } from '../enums/termination-initiation.enum';
export declare class CreateTerminationRequestDto {
    employeeId: string;
    initiator: TerminationInitiation;
    reason: string;
    employeeComments?: string;
    hrComments?: string;
    terminationDate?: string;
    contractId: string;
}
