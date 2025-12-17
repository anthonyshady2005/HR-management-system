"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInterviewDto = void 0;
const class_validator_1 = require("class-validator");
const application_stage_enum_1 = require("../enums/application-stage.enum");
const interview_method_enum_1 = require("../enums/interview-method.enum");
class CreateInterviewDto {
    applicationId;
    stage;
    scheduledDate;
    method;
    panel;
    calendarEventId;
    videoLink;
}
exports.CreateInterviewDto = CreateInterviewDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "applicationId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(application_stage_enum_1.ApplicationStage),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "stage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(interview_method_enum_1.InterviewMethod),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], CreateInterviewDto.prototype, "panel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "calendarEventId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "videoLink", void 0);
//# sourceMappingURL=create-interview.dto.js.map