"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLeavePolicyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_leave_policy_dto_1 = require("./create-leave-policy.dto");
class UpdateLeavePolicyDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_leave_policy_dto_1.CreateLeavePolicyDto, ['leaveTypeId'])) {
}
exports.UpdateLeavePolicyDto = UpdateLeavePolicyDto;
//# sourceMappingURL=update-leave-policy.dto.js.map