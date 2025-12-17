import { TerminationStatus } from '../enums/termination-status.enum';
export declare class UpdateTerminationStatusDto {
    status: TerminationStatus;
    hrComments?: string;
    terminationDate?: string;
}
